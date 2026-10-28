import type {
  JobListItem,
  JobsListResponse,
  JobSort,
  JobsQuery,
} from '@job-scraper/shared';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  type EntityManager,
  In,
  Repository,
  type SelectQueryBuilder,
} from 'typeorm';

import {
  type CreateJobRequest,
  salaryRangeIsValid,
} from './dto/create-job.dto.js';
import type { UpdateJobRequest } from './dto/update-job.dto.js';
import { Job } from './entities/job.entity.js';
import { UserJobMatch } from './entities/user-job-match.entity.js';
import { UserSavedJob } from './entities/user-saved-job.entity.js';
import { hasPgCode, jobNotFound } from './utils/db-errors.js';
import { definedOnly, toDate, toJobListItem } from './utils/job-list-item.js';
import { replaceSkills } from './utils/job-skills.js';
import { POSTED_AT, withinDays } from './utils/posted-at.js';

const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

const SORT_DIRECTIONS: Record<Exclude<JobSort, 'bestMatch'>, 'ASC' | 'DESC'> = {
  newest: 'DESC',
  oldest: 'ASC',
};

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    @InjectRepository(UserSavedJob)
    private readonly savedJobsRepository: Repository<UserSavedJob>,
    @InjectRepository(UserJobMatch)
    private readonly matchesRepository: Repository<UserJobMatch>,
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

  async findAll(query: JobsQuery, userId: string): Promise<JobsListResponse> {
    const { page, limit } = query;

    const total = await this.filteredQuery(query, userId).getCount();

    const rows = await this.sorted(
      this.filteredQuery(query, userId),
      query.sort,
      userId,
    )
      .select('job.id', 'id')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany<{ id: string }>();

    const items = await this.loadItems(
      rows.map((row) => row.id),
      userId,
    );
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Without `userId` (e.g. after create/update), `isSaved` is false. */
  async findOne(id: string, userId?: string): Promise<JobListItem> {
    const [item] = await this.loadItems([id], userId);
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

  /** Saving an already saved job does nothing. */
  async save(jobId: string, userId: string): Promise<void> {
    try {
      await this.savedJobsRepository
        .createQueryBuilder()
        .insert()
        .values({ jobId, userId })
        .orIgnore()
        .execute();
    } catch (error) {
      if (hasPgCode(error, FOREIGN_KEY_VIOLATION)) {
        throw jobNotFound(jobId);
      }
      throw error;
    }
  }

  /** Unsaving a job that is not saved does nothing. */
  async unsave(jobId: string, userId: string): Promise<void> {
    await this.savedJobsRepository.delete({ jobId, userId });
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

  private filteredQuery(
    query: JobsQuery,
    userId: string,
  ): SelectQueryBuilder<Job> {
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
      builder.andWhere(withinDays(POSTED_AT, 'postedWithinDays'), {
        postedWithinDays: query.postedWithinDays,
      });
    }
    if (query.saved) {
      builder.andWhere(
        `EXISTS (SELECT 1 FROM user_saved_jobs usj
          WHERE usj.job_id = job.id AND usj.user_id = :userId)`,
        { userId },
      );
    }
    return builder;
  }

  /** `bestMatch`: highest match first; jobs without a match last, newest first. */
  private sorted(
    builder: SelectQueryBuilder<Job>,
    sort: JobSort,
    userId: string,
  ): SelectQueryBuilder<Job> {
    if (sort === 'bestMatch') {
      return builder
        .leftJoin(
          UserJobMatch,
          'userMatch',
          'userMatch.jobId = job.id AND userMatch.userId = :userId',
          { userId },
        )
        .orderBy('userMatch.match', 'DESC', 'NULLS LAST')
        .addOrderBy(POSTED_AT, 'DESC')
        .addOrderBy('job.id', 'DESC');
    }
    const direction = SORT_DIRECTIONS[sort];
    return builder
      .orderBy(POSTED_AT, direction)
      .addOrderBy('job.id', direction);
  }

  private async loadItems(
    ids: string[],
    userId?: string,
  ): Promise<JobListItem[]> {
    if (ids.length === 0) {
      return [];
    }
    const [jobs, savedIds, matches] = await Promise.all([
      this.jobsRepository
        .createQueryBuilder('job')
        .innerJoinAndSelect('job.company', 'company')
        .leftJoinAndSelect('job.location', 'location')
        .leftJoinAndSelect('job.skills', 'jobSkill')
        .leftJoinAndSelect('jobSkill.skill', 'skill')
        .where('job.id IN (:...ids)', { ids })
        .orderBy('skill.name', 'ASC')
        .getMany(),
      this.findSavedIds(ids, userId),
      this.findMatches(ids, userId),
    ]);
    const byId = new Map(jobs.map((job) => [job.id, job]));
    return ids.flatMap((id) => {
      const job = byId.get(id);
      return job
        ? [toJobListItem(job, savedIds.has(id), matches.get(id) ?? null)]
        : [];
    });
  }

  /** The user's stored match per job; jobs without one are left out. */
  private async findMatches(
    jobIds: string[],
    userId: string | undefined,
  ): Promise<Map<string, number>> {
    if (!userId) {
      return new Map();
    }
    const matches = await this.matchesRepository.find({
      select: { jobId: true, match: true },
      where: { userId, jobId: In(jobIds) },
    });
    return new Map(matches.map(({ jobId, match }) => [jobId, match]));
  }

  /** Which of `jobIds` the user has saved. */
  private async findSavedIds(
    jobIds: string[],
    userId: string | undefined,
  ): Promise<Set<string>> {
    if (!userId) {
      return new Set();
    }
    const saved = await this.savedJobsRepository.find({
      select: { jobId: true },
      where: { userId, jobId: In(jobIds) },
    });
    return new Set(saved.map(({ jobId }) => jobId));
  }
}
