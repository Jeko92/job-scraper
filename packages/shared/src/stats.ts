import { z } from 'zod';

import { type JobCompany, jobCompanySchema } from './jobs';
import { type Skill, skillSchema } from './skills';

export interface StatsSkill extends Skill {
  share: number;
}

export interface StatsCompany extends JobCompany {
  openJobs: number;
}

export interface UserStats {
  periodDays: number;
  fields: string[];
  newJobs: number;
  activeJobs: number;
  hiringCompanies: number;
  newCompanies: number;
  topSkills: StatsSkill[];
  topCompanies: StatsCompany[];
}

const countSchema = z.number().int().min(0);

export const userStatsSchema: z.ZodType<UserStats> = z.object({
  periodDays: z.number().int().min(1),
  fields: z.array(z.string()),
  newJobs: countSchema,
  activeJobs: countSchema,
  hiringCompanies: countSchema,
  newCompanies: countSchema,
  topSkills: z.array(
    skillSchema.and(z.object({ share: z.number().int().min(0).max(100) })),
  ),
  topCompanies: z.array(
    jobCompanySchema.and(z.object({ openJobs: countSchema })),
  ),
});
