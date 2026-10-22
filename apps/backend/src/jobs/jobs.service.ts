import {
  EMPLOYMENT_TYPES,
  type JobListItem,
  type JobsListResponse,
  type JobSort,
  type JobsQuery,
  REMOTE_PREFERENCES,
} from '@job-scraper/shared';
import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  type EntityManager,
  In,
  QueryFailedError,
  Repository,
  type SelectQueryBuilder,
} from 'typeorm';

import { type AiOutputFormat, AiProvider } from '../common/ai/ai-provider.js';
import { Company } from '../companies/entities/company.entity.js';
import { toLocationDto } from '../locations/locations.service.js';
import { Skill } from '../skills/entities/skill.entity.js';
import {
  type CreateJobRequest,
  createJobSchema,
  type JobSkillInput,
  salaryRangeIsValid,
} from './dto/create-job.dto.js';
import type { UpdateJobRequest } from './dto/update-job.dto.js';
import { Job } from './entities/job.entity.js';
import { JobSkill } from './entities/job-skill.entity.js';

const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

const POSTED_AT = 'COALESCE(job.publishedAt, job.firstSeenAt)';

const SORT_DIRECTIONS: Record<JobSort, 'ASC' | 'DESC'> = {
  newest: 'DESC',
  oldest: 'ASC',
};

/** Upper limit of generated tokens, including reasoning tokens. */
const CRAWL_MAX_OUTPUT_TOKENS = 16_000;
/** Page text sent to the model is cut off here to bound input tokens. */
const CRAWL_MAX_PAGE_LENGTH = 60_000;
const CRAWL_MAX_JOBS = 50;
const CRAWL_MAX_SITEMAP_URLS = 500;
const CRAWL_FETCH_TIMEOUT_MS = 15_000;
/** Job listing pages fetched and extracted at the same time. */
const CRAWL_CONCURRENCY = 5;

const CRAWL_INSTRUCTIONS = [
  'You crawl a company website to extract its open job postings.',
  'The company website URL is the starting point of the crawl.',
  'The company website is the only source of truth. Never use job boards, portals or aggregators, and never return their URLs.',
  'Find the careers or job listings page through the sitemap, the navigation bar and the footer of the website.',
  'Crawl each job listing individually from its own page.',
  'Use only information stated on the page. Never invent, guess or translate values; use null when a value is not stated.',
  'Return one entry per open position. Ignore navigation, news and closed positions. Return an empty list when the page lists no jobs.',
  'title: the job title exactly as written.',
  'description: a short plain-text summary of the posting.',
  'externalId: the requisition or job id shown on the page.',
  'salaryMin, salaryMax: yearly gross amounts as numbers; salaryCurrency: ISO 4217 code.',
  'publishedAt: ISO 8601 date-time with offset.',
].join('\n');

const nullable = (type: string, extra: Record<string, unknown> = {}) => ({
  type: [type, 'null'],
  ...extra,
});

const strictFormat = (
  name: string,
  properties: Record<string, unknown>,
): AiOutputFormat => ({
  name,
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: Object.keys(properties),
    properties,
  },
});

const CAREERS_PAGE_FORMAT = strictFormat('careers_page', {
  careersUrl: nullable('string'),
});

const JOB_URLS_FORMAT = strictFormat('job_listing_urls', {
  jobUrls: {
    type: 'array',
    maxItems: CRAWL_MAX_JOBS,
    items: { type: 'string' },
  },
});

/** Strict format mirroring the job columns of `CreateJobRequest`. */
const JOB_FORMAT = strictFormat('job_listing', {
  job: {
    anyOf: [
      strictFormat('job', {
        title: { type: 'string' },
        description: nullable('string'),
        externalId: nullable('string'),
        employmentType: nullable('string', {
          enum: [...EMPLOYMENT_TYPES, null],
        }),
        workplaceType: nullable('string', {
          enum: [...REMOTE_PREFERENCES, null],
        }),
        salaryMin: nullable('number', { minimum: 0 }),
        salaryMax: nullable('number', { minimum: 0 }),
        salaryCurrency: nullable('string', { pattern: '^[A-Z]{3}$' }),
        publishedAt: nullable('string', { format: 'date-time' }),
      }).schema,
      { type: 'null' },
    ],
  },
});

/** `sourceUrl` is the crawled page, the ids are set by us. */
type CrawledJob = Omit<
  CreateJobRequest,
  'companyId' | 'locationId' | 'skills' | 'sourceUrl'
>;

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    private readonly aiProvider: AiProvider,
  ) {}

  /**
   * Crawls the company's website for open jobs and saves the new ones:
   * website → careers page (sitemap, navigation, footer) → each job listing.
   * Only pages on the company's own domain are followed.
   */
  async crawl(companyId: string): Promise<JobListItem[]> {
    const company = await this.companiesRepository.findOneBy({
      id: companyId,
    });
    if (!company) {
      throw new NotFoundException(`Company "${companyId}" not found`);
    }
    if (!company.websiteUrl) {
      throw new BadRequestException(
        `Company "${companyId}" has no websiteUrl to crawl`,
      );
    }
    const websiteUrl = company.websiteUrl;
    const onSite = sameSite(websiteUrl);

    const [homepage, sitemapUrls] = await Promise.all([
      fetchPageText(websiteUrl),
      fetchSitemapUrls(websiteUrl),
    ]);
    const { careersUrl } = await this.askAi<{ careersUrl: string | null }>(
      [
        'Task: find the careers or job listings page of this website.',
        `Website URL: ${websiteUrl}`,
        `Sitemap URLs:\n${sitemapUrls.filter(onSite).join('\n') || '(none)'}`,
        `Homepage content, including navigation bar and footer:\n"""\n${homepage}\n"""`,
      ].join('\n\n'),
      CAREERS_PAGE_FORMAT,
    );

    const resolvedCareersUrl = careersUrl
      ? absoluteUrl(careersUrl, websiteUrl)
      : null;
    const careersPageUrl =
      resolvedCareersUrl && onSite(resolvedCareersUrl)
        ? resolvedCareersUrl
        : websiteUrl;
    const careersPage =
      careersPageUrl === websiteUrl
        ? homepage
        : await fetchPageText(careersPageUrl);
    const { jobUrls } = await this.askAi<{ jobUrls: string[] }>(
      [
        'Task: list the URLs of the individual job listing pages on this careers page.',
        `Careers page URL: ${careersPageUrl}`,
        `Page content:\n"""\n${careersPage}\n"""`,
      ].join('\n\n'),
      JOB_URLS_FORMAT,
    );

    const candidates = [
      ...new Set(
        jobUrls.flatMap((url) => {
          const absolute = absoluteUrl(url, careersPageUrl);
          return absolute && onSite(absolute) ? [absolute] : [];
        }),
      ),
    ];
    const known =
      candidates.length > 0
        ? await this.jobsRepository.find({
            select: { sourceUrl: true },
            where: { companyId, sourceUrl: In(candidates) },
          })
        : [];
    const knownUrls = new Set(known.map(({ sourceUrl }) => sourceUrl));
    const newUrls = candidates.filter((url) => !knownUrls.has(url));

    const created: JobListItem[] = [];
    for (let i = 0; i < newUrls.length; i += CRAWL_CONCURRENCY) {
      const inputs = await Promise.all(
        newUrls
          .slice(i, i + CRAWL_CONCURRENCY)
          .map((url) => this.crawlJob(companyId, url)),
      );
      for (const input of inputs) {
        if (!input) {
          continue;
        }
        try {
          created.push(await this.create(input));
        } catch (error) {
          // Already crawled before: same externalId.
          if (!(error instanceof ConflictException)) {
            throw error;
          }
        }
      }
    }
    return created;
  }

  /** Extracts one job listing page; `null` when it holds no valid job. */
  private async crawlJob(
    companyId: string,
    sourceUrl: string,
  ): Promise<CreateJobRequest | null> {
    try {
      const page = await fetchPageText(sourceUrl);
      const { job } = await this.askAi<{ job: CrawledJob | null }>(
        [
          'Task: extract the job posting on this job listing page.',
          `Job listing URL: ${sourceUrl}`,
          `Page content:\n"""\n${page}\n"""`,
        ].join('\n\n'),
        JOB_FORMAT,
      );
      if (!job) {
        return null;
      }
      const input = createJobSchema.safeParse({ ...job, companyId, sourceUrl });
      if (!input.success) {
        this.logger.warn(`Skipped invalid job listing "${sourceUrl}"`);
        return null;
      }
      return input.data;
    } catch (error) {
      this.logger.warn(`Skipped job listing "${sourceUrl}": ${String(error)}`);
      return null;
    }
  }

  private async askAi<T>(
    input: string,
    outputFormat: AiOutputFormat,
  ): Promise<T> {
    const result = await this.aiProvider
      .generateJson({
        instructions: CRAWL_INSTRUCTIONS,
        input,
        outputFormat,
        maxOutputTokens: CRAWL_MAX_OUTPUT_TOKENS,
      })
      .catch((error: unknown) => {
        throw new BadGatewayException('AI request failed', { cause: error });
      });
    if (result.truncated) {
      throw new UnprocessableEntityException(
        'AI response was cut off at the output token limit',
      );
    }
    // The strict output format guarantees this shape.
    return JSON.parse(result.text) as T;
  }

  async create(input: CreateJobRequest): Promise<JobListItem> {
    const { skills, publishedAt, ...fields } = input;
    const id = await this.write(async (manager) => {
      const job = await manager.save(
        manager.create(Job, {
          ...definedOnly(fields),
          publishedAt: toDate(publishedAt),
        }),
      );
      if (skills) {
        await replaceSkills(manager, job.id, skills);
      }
      return job.id;
    });
    return this.findOne(id);
  }

  async findAll(query: JobsQuery): Promise<JobsListResponse> {
    const { page, limit } = query;
    const direction = SORT_DIRECTIONS[query.sort];

    const total = await this.filteredQuery(query).getCount();

    const rows = await this.filteredQuery(query)
      .select('job.id', 'id')
      .orderBy(POSTED_AT, direction)
      .addOrderBy('job.id', direction)
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany<{ id: string }>();

    const items = await this.loadItems(rows.map((row) => row.id));
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<JobListItem> {
    const [item] = await this.loadItems([id]);
    if (!item) {
      throw jobNotFound(id);
    }
    return item;
  }

  async update(id: string, input: UpdateJobRequest): Promise<JobListItem> {
    const { skills, publishedAt, ...fields } = input;
    await this.write(async (manager) => {
      const job = await manager.findOneBy(Job, { id });
      if (!job) {
        throw jobNotFound(id);
      }
      manager.merge(Job, job, definedOnly(fields));
      if (publishedAt !== undefined) {
        job.publishedAt = toDate(publishedAt);
      }
      if (!salaryRangeIsValid(job)) {
        throw new BadRequestException(
          'salaryMin must not be greater than salaryMax',
        );
      }
      await manager.save(job);
      if (skills) {
        await replaceSkills(manager, id, skills);
      }
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.jobsRepository.delete({ id });
    if (!result.affected) {
      throw jobNotFound(id);
    }
  }

  private async write<T>(
    work: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    try {
      return await this.jobsRepository.manager.transaction(work);
    } catch (error) {
      if (hasPgCode(error, UNIQUE_VIOLATION)) {
        throw new ConflictException(
          'A job with this sourceUrl or externalId already exists for the company',
        );
      }
      if (hasPgCode(error, FOREIGN_KEY_VIOLATION)) {
        throw new BadRequestException('Unknown companyId or locationId');
      }
      throw error;
    }
  }

  private filteredQuery(query: JobsQuery): SelectQueryBuilder<Job> {
    const builder = this.jobsRepository
      .createQueryBuilder('job')
      .where('job.isActive = true');

    if (query.workplaceType) {
      builder.andWhere('job.workplaceType IN (:...workplaceType)', {
        workplaceType: query.workplaceType,
      });
    }
    if (query.employmentType) {
      builder.andWhere('job.employmentType IN (:...employmentType)', {
        employmentType: query.employmentType,
      });
    }
    if (query.locationId) {
      builder.andWhere('job.locationId IN (:...locationId)', {
        locationId: query.locationId,
      });
    }
    if (query.skill) {
      builder.andWhere(
        `EXISTS (SELECT 1 FROM job_skills js
          JOIN skills s ON s.id = js.skill_id
          WHERE js.job_id = job.id AND s.slug IN (:...skill))`,
        { skill: query.skill },
      );
    }
    if (query.postedWithinDays) {
      builder.andWhere(
        `${POSTED_AT} >= NOW() - make_interval(days => :postedWithinDays)`,
        { postedWithinDays: query.postedWithinDays },
      );
    }
    return builder;
  }

  private async loadItems(ids: string[]): Promise<JobListItem[]> {
    if (ids.length === 0) {
      return [];
    }
    const jobs = await this.jobsRepository
      .createQueryBuilder('job')
      .innerJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('job.location', 'location')
      .leftJoinAndSelect('job.skills', 'jobSkill')
      .leftJoinAndSelect('jobSkill.skill', 'skill')
      .where('job.id IN (:...ids)', { ids })
      .orderBy('skill.name', 'ASC')
      .getMany();
    const byId = new Map(jobs.map((job) => [job.id, job]));
    return ids.flatMap((id) => {
      const job = byId.get(id);
      return job ? [toJobListItem(job)] : [];
    });
  }
}

async function replaceSkills(
  manager: EntityManager,
  jobId: string,
  skills: JobSkillInput[],
): Promise<void> {
  const slugs = skills.map(({ slug }) => slug);
  const found =
    slugs.length > 0
      ? await manager.find(Skill, { where: { slug: In(slugs) } })
      : [];
  const idBySlug = new Map(found.map((skill) => [skill.slug, skill.id]));
  const unknown = slugs.filter((slug) => !idBySlug.has(slug));
  if (unknown.length > 0) {
    throw new BadRequestException(`Unknown skills: ${unknown.join(', ')}`);
  }

  await manager.delete(JobSkill, { jobId });
  const rows = skills.flatMap(({ slug, required }) => {
    const skillId = idBySlug.get(slug);
    return skillId ? [{ jobId, skillId, required: required ?? true }] : [];
  });
  if (rows.length > 0) {
    await manager.insert(JobSkill, rows);
  }
}

function toJobListItem(job: Job): JobListItem {
  const company = job.company;
  if (!company) {
    throw new Error(`Job "${job.id}" was loaded without its company`);
  }
  return {
    id: job.id,
    title: job.title,
    company: { id: company.id, name: company.name, domain: company.domain },
    location: job.location ? toLocationDto(job.location) : null,
    workplaceType: oneOf(REMOTE_PREFERENCES, job.workplaceType),
    employmentType: oneOf(EMPLOYMENT_TYPES, job.employmentType),
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    postedAt: (job.publishedAt ?? job.firstSeenAt).toISOString(),
    skills: (job.skills ?? []).flatMap(({ skill, required }) =>
      skill
        ? [{ id: skill.id, name: skill.name, slug: skill.slug, required }]
        : [],
    ),
  };
}

type DefinedOnly<T> = { [K in keyof T]?: Exclude<T[K], undefined> };

function definedOnly<T extends object>(value: T): DefinedOnly<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as DefinedOnly<T>;
}

function toDate(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null;
}

function oneOf<T extends string>(
  values: readonly T[],
  value: string | null,
): T | null {
  return values.find((allowed) => allowed === value) ?? null;
}

function jobNotFound(id: string): NotFoundException {
  return new NotFoundException(`Job "${id}" not found`);
}

function hasPgCode(error: unknown, code: string): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }
  const driverError: unknown = error.driverError;
  return (
    typeof driverError === 'object' &&
    driverError !== null &&
    'code' in driverError &&
    driverError.code === code
  );
}

async function fetchPage(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(CRAWL_FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`${String(response.status)} ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    throw new BadGatewayException(`Could not load "${url}"`, {
      cause: error,
    });
  }
}

/** Loads a page as plain text; links stay visible as `label [url]`. */
async function fetchPageText(url: string): Promise<string> {
  const html = await fetchPage(url);
  return html
    .replace(/<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(
      /<a\b[^>]*?\bhref=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
      (_, href: string, label: string) => {
        const link = absoluteUrl(href, url);
        return link ? ` ${label} [${link}] ` : ` ${label} `;
      },
    )
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, CRAWL_MAX_PAGE_LENGTH);
}

/** URLs from `/sitemap.xml`; empty when the website has none. */
async function fetchSitemapUrls(websiteUrl: string): Promise<string[]> {
  const xml = await fetchPage(new URL('/sitemap.xml', websiteUrl).href).catch(
    () => '',
  );
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .flatMap((match) => (match[1] ? [match[1]] : []))
    .slice(0, CRAWL_MAX_SITEMAP_URLS);
}

/** Resolves `href` against `baseUrl`; only http(s) URLs, without `#hash`. */
function absoluteUrl(href: string, baseUrl: string): string | null {
  try {
    const url = new URL(href, baseUrl);
    url.hash = '';
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.href
      : null;
  } catch {
    return null;
  }
}

/** Matches URLs on the website's domain or its subdomains. */
function sameSite(websiteUrl: string): (url: string) => boolean {
  const site = hostOf(websiteUrl);
  return (url) => {
    const host = hostOf(url);
    return host !== '' && (host === site || host.endsWith(`.${site}`));
  };
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}
