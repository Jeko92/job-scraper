import {
  type JobListItem,
  type UserStats,
  userStatsSchema,
} from '@job-scraper/shared';

import { readAuthToken } from '@/lib/auth/auth-token';
import { getFromBackend } from '@/lib/backend';
import { getHomeJobsLimit } from '@/lib/env';
import { fetchJobsPage } from '@/lib/jobs/api';

const DEFAULT_HOME_JOBS_LIMIT = 6;

export function getSavedJobs(): Promise<JobListItem[]> {
  return Promise.resolve([]);
}

export async function getLatestJobs(): Promise<JobListItem[] | null> {
  try {
    const page = await fetchJobsPage({
      sort: 'newest',
      page: 1,
      limit: getHomeJobsLimit() ?? DEFAULT_HOME_JOBS_LIMIT,
    });
    return page.items;
  } catch {
    return null;
  }
}

export async function getUserStats(): Promise<UserStats | null> {
  const token = await readAuthToken();
  if (token === undefined) {
    return null;
  }

  try {
    const response = await getFromBackend('/users/me/stats', token);
    if (!response.ok) {
      return null;
    }
    const stats = userStatsSchema.safeParse(await response.json());
    return stats.success ? stats.data : null;
  } catch {
    return null;
  }
}
