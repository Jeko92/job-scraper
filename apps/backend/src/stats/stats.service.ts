import type { UserStats } from '@job-scraper/shared';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';

import { Company } from '../companies/entities/company.entity.js';
import type { Env } from '../config/env.js';
import { Job } from '../jobs/entities/job.entity.js';
import { POSTED_AT } from '../jobs/jobs.service.js';
import { UserIndustry } from '../users/entities/user-industry.entity.js';

const SINCE = 'NOW() - make_interval(days => :periodDays)';
const PERCENT = 100;

interface JobCountsRow {
  activeJobs: string;
  newJobs: string;
  hiringCompanies: string;
}

interface SkillRow {
  id: string;
  name: string;
  slug: string;
  jobs: string;
}

@Injectable()
export class StatsService {
  constructor(
    private readonly config: ConfigService<Env, true>,
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(UserIndustry)
    private readonly userIndustriesRepository: Repository<UserIndustry>,
  ) {}

  async getForUser(userId: string): Promise<UserStats> {
    const periodDays = this.config.get('STATS_PERIOD_DAYS', { infer: true });
    const topLimit = this.config.get('STATS_TOP_LIMIT', { infer: true });
    const industryIds = await this.findIndustryIds(userId);

    const [counts, newCompanies, skills] = await Promise.all([
      this.activeJobsInFields(industryIds)
        .select('COUNT(*)', 'activeJobs')
        .addSelect(
          `COUNT(*) FILTER (WHERE ${POSTED_AT} >= ${SINCE})`,
          'newJobs',
        )
        .addSelect('COUNT(DISTINCT job.companyId)', 'hiringCompanies')
        .setParameters({ periodDays })
        .getRawOne<JobCountsRow>(),
      this.inFields(
        this.companiesRepository
          .createQueryBuilder('company')
          .where(`company.createdAt >= ${SINCE}`, { periodDays }),
        'company.id',
        industryIds,
      ).getCount(),
      this.activeJobsInFields(industryIds)
        .innerJoin('job.skills', 'jobSkill')
        .innerJoin('jobSkill.skill', 'skill')
        .select('skill.id', 'id')
        .addSelect('skill.name', 'name')
        .addSelect('skill.slug', 'slug')
        .addSelect('COUNT(DISTINCT job.id)', 'jobs')
        .groupBy('skill.id')
        .orderBy('COUNT(DISTINCT job.id)', 'DESC')
        .addOrderBy('skill.name', 'ASC')
        .limit(topLimit)
        .getRawMany<SkillRow>(),
    ]);
    const activeJobs = Number(counts?.activeJobs ?? 0);

    return {
      periodDays,
      newJobs: Number(counts?.newJobs ?? 0),
      activeJobs,
      hiringCompanies: Number(counts?.hiringCompanies ?? 0),
      newCompanies,
      topSkills: skills.map(({ jobs, ...skill }) => ({
        ...skill,
        share:
          activeJobs === 0
            ? 0
            : Math.round((Number(jobs) / activeJobs) * PERCENT),
      })),
      topCompanies: [],
    };
  }

  private async findIndustryIds(userId: string): Promise<string[]> {
    const rows = await this.userIndustriesRepository
      .createQueryBuilder('userIndustry')
      .innerJoin('userIndustry.userProfile', 'profile')
      .select('userIndustry.industryId', 'industryId')
      .where('profile.userId = :userId', { userId })
      .getRawMany<{ industryId: string }>();
    return rows.map((row) => row.industryId);
  }

  private activeJobsInFields(industryIds: string[]): SelectQueryBuilder<Job> {
    return this.inFields(
      this.jobsRepository
        .createQueryBuilder('job')
        .where('job.isActive = true'),
      'job.companyId',
      industryIds,
    );
  }

  private inFields<T extends ObjectLiteral>(
    builder: SelectQueryBuilder<T>,
    companyIdColumn: string,
    industryIds: string[],
  ): SelectQueryBuilder<T> {
    if (industryIds.length === 0) {
      return builder;
    }
    return builder.andWhere(
      `${companyIdColumn} IN (SELECT ci.company_id FROM company_industries ci
        WHERE ci.industry_id IN (:...industryIds))`,
      { industryIds },
    );
  }
}
