import {
  type JobDetail,
  jobDetailSchema,
  type JobsListResponse,
  jobsListResponseSchema,
  type JobsQuery,
} from '@job-scraper/shared';

import { requireAuthToken } from '@/lib/auth/auth-token';
import { getFromBackend } from '@/lib/backend';

import { toJobsSearchParams } from './query-url';

/** Throws when not logged in, or when the backend fails or answers unexpectedly. */
export async function fetchJobsPage(
  query: JobsQuery,
): Promise<JobsListResponse> {
  const token = await requireAuthToken();
  const qs = toJobsSearchParams(query).toString();
  const response = await getFromBackend(`/jobs?${qs}`, token);
  if (!response.ok) {
    throw new Error(`GET /jobs failed with status ${String(response.status)}`);
  }
  return jobsListResponseSchema.parse(await response.json());
}

/**
 * Null when the job doesn't exist. Throws when not logged in, or when the
 * backend fails or answers unexpectedly.
 */
export async function fetchJobDetail(id: string): Promise<JobDetail | null> {
  const token = await requireAuthToken();
  const response = await getFromBackend(
    `/jobs/${encodeURIComponent(id)}`,
    token,
  );
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(
      `GET /jobs/:id failed with status ${String(response.status)}`,
    );
  }
  // The backend doesn't send `description` yet (#39); its value wins once it does.
  const json = (await response.json()) as object;
  return jobDetailSchema.parse({ description: null, ...json });
}
