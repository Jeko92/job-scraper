import { z } from 'zod';

export const sourceNameSchema = z.string().regex(/^[a-z0-9-]{1,64}$/);

export const sourceStatusSchema = z.object({
  name: z.string(),
  cron: z.string(),
  running: z.boolean(),
});

export const syncSummarySchema = z.object({
  source: z.string(),
  fetched: z.number().int().nonnegative(),
  upserted: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  durationMs: z.number().int().nonnegative(),
});

export type SourceName = z.infer<typeof sourceNameSchema>;
export type SourceStatus = z.infer<typeof sourceStatusSchema>;
export type SyncSummary = z.infer<typeof syncSummarySchema>;
