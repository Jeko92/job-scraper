import { z } from 'zod';

import { lookupLimitSchema, lookupSearchSchema } from './lookup-query';

export interface Skill {
  id: string;
  name: string;
  slug: string;
}

export const skillSchema: z.ZodType<Skill> = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
});

export const skillListSchema: z.ZodType<Skill[]> = z.array(skillSchema);

export interface SkillsQuery {
  search?: string | undefined;
  limit: number;
}

export const skillsQuerySchema: z.ZodType<SkillsQuery> = z.object({
  search: lookupSearchSchema,
  limit: lookupLimitSchema,
});
