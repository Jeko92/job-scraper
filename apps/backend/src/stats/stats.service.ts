import type { StatsCompany, UserStats } from '@job-scraper/shared';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';

import { Company } from '../companies/entities/company.entity.js';
import type { Env } from '../config/env.js';
import { Job } from '../jobs/entities/job.entity.js';
import { POSTED_AT, withinDays } from '../jobs/utils/posted-at.js';
import { UserIndustry } from '../users/entities/user-industry.entity.js';

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

interface CompanyRow extends Omit<StatsCompany, 'openJobs'> {
  openJobs: string;
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
    const industries = await this.findIndustries(userId);
    const industryIds = industries.map((industry) => industry.id);

    const [counts, newCompanies, skills, companies] = await Promise.all([
      this.activeJobsInFields(industryIds)
        .select('COUNT(*)', 'activeJobs')
        .addSelect(
          `COUNT(*) FILTER (WHERE ${withinDays(POSTED_AT, 'periodDays')})`,
          'newJobs',
        )
        .addSelect('COUNT(DISTINCT job.companyId)', 'hiringCompanies')
        .setParameters({ periodDays })
        .getRawOne<JobCountsRow>(),
      this.inFields(
        this.companiesRepository
          .createQueryBuilder('company')
          .where(withinDays('company.createdAt', 'periodDays'), { periodDays }),
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
      this.activeJobsInFields(industryIds)
        .innerJoin('job.company', 'company')
        .select('company.id', 'id')
        .addSelect('company.name', 'name')
        .addSelect('company.domain', 'domain')
        .addSelect('COUNT(*)', 'openJobs')
        .groupBy('company.id')
        .orderBy('COUNT(*)', 'DESC')
        .addOrderBy('company.name', 'ASC', 'NULLS LAST')
        .limit(topLimit)
        .getRawMany<CompanyRow>(),
    ]);
    const activeJobs = Number(counts?.activeJobs ?? 0);

    return {
      periodDays,
      fields: industries.map((industry) => industry.name),
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
      topCompanies: companies.map(({ openJobs, ...company }) => ({
        ...company,
        openJobs: Number(openJobs),
      })),
    };
  }

  private findIndustries(
    userId: string,
  ): Promise<{ id: string; name: string }[]> {
    return this.userIndustriesRepository
      .createQueryBuilder('userIndustry')
      .innerJoin('userIndustry.userProfile', 'profile')
      .innerJoin('userIndustry.industry', 'industry')
      .select('industry.id', 'id')
      .addSelect('industry.name', 'name')
      .where('profile.userId = :userId', { userId })
      .orderBy('userIndustry.priority', 'ASC', 'NULLS LAST')
      .addOrderBy('industry.name', 'ASC')
      .getRawMany<{ id: string; name: string }>();
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
