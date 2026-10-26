import type { UserStats } from '@job-scraper/shared';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../config/env.js';

@Injectable()
export class StatsService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  getForUser(): Promise<UserStats> {
    return Promise.resolve({
      periodDays: this.config.get('STATS_PERIOD_DAYS', { infer: true }),
      newJobs: 0,
      activeJobs: 0,
      hiringCompanies: 0,
      newCompanies: 0,
      topSkills: [],
      topCompanies: [],
    });
  }
}
