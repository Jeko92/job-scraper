import {
  type JobsPreviewQuery,
  jobsPreviewQuerySchema,
} from '@job-scraper/shared';

import type { RawSearchParams } from '@/lib/jobs/query-url';
import { EXPLORE_HREF } from '@/lib/routes';

const PREVIEW_FILTER_KEYS = ['skill', 'city'] as const;

/** Invalid params (e.g. an unknown city or an empty hero select) are dropped one by one. */
export function parsePreviewQuery(params: RawSearchParams): JobsPreviewQuery {
  const query: JobsPreviewQuery = {};
  for (const key of PREVIEW_FILTER_KEYS) {
    const parsed = jobsPreviewQuerySchema.safeParse({ [key]: params[key] });
    if (parsed.success) {
      Object.assign(query, parsed.data);
    }
  }
  return query;
}

/** Repeats keys for several values. */
export function toPreviewSearchParams(
  query: JobsPreviewQuery,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of PREVIEW_FILTER_KEYS) {
    for (const value of query[key] ?? []) {
      params.append(key, value);
    }
  }
  return params;
}

/** Link to the explore page with these filters, e.g. `/explore?skill=react`. */
export function explorePageHref(query: JobsPreviewQuery): string {
  const qs = toPreviewSearchParams(query).toString();
  return qs === '' ? EXPLORE_HREF : `${EXPLORE_HREF}?${qs}`;
}
