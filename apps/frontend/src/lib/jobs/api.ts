import {
  type JobsListResponse,
  jobsListResponseSchema,
  type JobsQuery,
} from '@job-scraper/shared';

import { readAuthToken } from '@/lib/auth/auth-token';
import { getFromBackend } from '@/lib/backend';

import { toJobsSearchParams } from './search-params';

/** Throws when not logged in, or when the backend fails or answers unexpectedly. */
export async function fetchJobsPage(
  query: JobsQuery,
): Promise<JobsListResponse> {
  const token = await readAuthToken();
  if (token === undefined) {
    throw new Error('Not logged in');
  }

  const qs = toJobsSearchParams(query).toString();
  const response = await getFromBackend(`/jobs?${qs}`, token);
  if (!response.ok) {
    throw new Error(`GET /jobs failed with status ${String(response.status)}`);
  }
  return jobsListResponseSchema.parse(await response.json());
}
