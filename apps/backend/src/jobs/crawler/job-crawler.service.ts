import {
  EMPLOYMENT_TYPES,
  type JobListItem,
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
import { In, Repository } from 'typeorm';

import {
  type AiOutputFormat,
  AiProvider,
} from '../../common/ai/ai-provider.js';
import { Company } from '../../companies/entities/company.entity.js';
import {
  type CreateJobRequest,
  createJobSchema,
} from '../dto/create-job.dto.js';
import { Job } from '../entities/job.entity.js';
import { JobsService } from '../jobs.service.js';

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
export class JobCrawlerService {
  private readonly logger = new Logger(JobCrawlerService.name);

  constructor(
    private readonly jobsService: JobsService,
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
          created.push(await this.jobsService.create(input));
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
