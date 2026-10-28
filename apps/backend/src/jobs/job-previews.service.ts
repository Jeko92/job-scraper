import {
  type JobListItem,
  JOBS_PREVIEW_LIMIT,
  type JobsPreviewQuery,
  type JobsPreviewResponse,
} from '@job-scraper/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type SelectQueryBuilder } from 'typeorm';

import { Job } from './entities/job.entity.js';
import { toJobListItem } from './utils/job-list-item.js';
import { POSTED_AT } from './utils/posted-at.js';

/** A teaser of active jobs for prospects, who are not logged in. */
@Injectable()
export class JobPreviewsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
  ) {}

  /** The newest matching jobs, at most `JOBS_PREVIEW_LIMIT`, and the total. */
  async preview(query: JobsPreviewQuery): Promise<JobsPreviewResponse> {
    const total = await this.filteredQuery(query).getCount();
    const rows = await this.filteredQuery(query)
      .select('job.id', 'id')
      .orderBy(POSTED_AT, 'DESC')
      .addOrderBy('job.id', 'DESC')
      .limit(JOBS_PREVIEW_LIMIT)
      .getRawMany<{ id: string }>();
    const items = await this.loadItems(rows.map((row) => row.id));
    return { items, total };
  }

  private filteredQuery(query: JobsPreviewQuery): SelectQueryBuilder<Job> {
    const builder = this.jobsRepository
      .createQueryBuilder('job')
      .where('job.isActive = true');

    if (query.city) {
      builder.andWhere(
        `EXISTS (SELECT 1 FROM locations l
          WHERE l.id = job.location_id AND l.city IN (:...city))`,
        { city: query.city },
      );
    }
    if (query.skill) {
      builder.andWhere(
        `EXISTS (SELECT 1 FROM job_skills js
          JOIN skills s ON s.id = js.skill_id
          WHERE js.job_id = job.id AND s.slug IN (:...skill))`,
        { skill: query.skill },
      );
    }
    return builder;
  }

  /** In the order of `ids`; nothing user specific (not saved, no match). */
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
      // No link to the original posting before signing up.
      return job
        ? [{ ...toJobListItem(job, false, null), sourceUrl: undefined }]
        : [];
    });
  }
}
