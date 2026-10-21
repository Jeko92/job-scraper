import {
  EMPLOYMENT_TYPES,
  type JobListItem,
  REMOTE_PREFERENCES,
} from '@job-scraper/shared';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type EntityManager, In, QueryFailedError, Repository } from 'typeorm';

import { toLocationDto } from '../locations/locations.service.js';
import { Skill } from '../skills/entities/skill.entity.js';
import {
  type CreateJobRequest,
  type JobSkillInput,
  salaryRangeIsValid,
} from './dto/create-job.dto.js';
import type { UpdateJobRequest } from './dto/update-job.dto.js';
import { Job } from './entities/job.entity.js';
import { JobSkill } from './entities/job-skill.entity.js';

const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
  ) {}

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

  findAll() {
    return `This action returns all jobs`;
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
