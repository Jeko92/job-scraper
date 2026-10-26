import type { JobListItem } from '@job-scraper/shared';

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
