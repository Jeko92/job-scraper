import {
  type JobsPreviewQuery,
  type JobsPreviewResponse,
  jobsPreviewResponseSchema,
} from '@job-scraper/shared';

import { getFromBackend } from '@/lib/backend';

import { toPreviewSearchParams } from './query-url';

/** Public, no login needed. Throws when the backend fails or answers unexpectedly. */
export async function fetchJobsPreview(
  query: JobsPreviewQuery,
): Promise<JobsPreviewResponse> {
  const qs = toPreviewSearchParams(query).toString();
  const response = await getFromBackend(`/job-previews?${qs}`);
  if (!response.ok) {
    throw new Error(
      `GET /job-previews failed with status ${String(response.status)}`,
    );
  }
  return jobsPreviewResponseSchema.parse(await response.json());
}
