import type { JobListItem } from '@job-scraper/shared';

export function getSavedJobs(): Promise<JobListItem[]> {
  return Promise.resolve([]);
}
