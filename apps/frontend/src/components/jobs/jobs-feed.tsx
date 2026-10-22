import type { JobsListResponse, JobsQuery } from '@job-scraper/shared';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatJobCount } from '@/lib/jobs/format';

import { JobCard } from './job-card';
import { JobsPagination } from './jobs-pagination';

interface JobsFeedProps {
  query: JobsQuery;
  result: JobsListResponse;
}

export function JobsFeed({ query, result }: JobsFeedProps) {
  const { items, total, page, limit, totalPages } = result;

  if (items.length === 0) {
    return (
      <Card className="items-center gap-2 rounded-card p-10 text-center ring-line">
        <p className="font-heading text-2xl text-ink">No jobs match yet</p>
        <p className="text-sm text-ink-muted">
          Try removing a filter or widening your search.
        </p>
      </Card>
    );
  }

  const from = (page - 1) * limit + 1;
  const to = from + items.length - 1;

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {items.map((job) => (
          <li key={job.id}>
            <JobCard job={job} />
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-center gap-3 pt-3 sm:justify-between">
        <Badge className="hidden h-7 bg-highlight px-3 text-on-highlight sm:inline-flex">
          Showing {formatJobCount(from)}–{formatJobCount(to)} of{' '}
          {formatJobCount(total)}
        </Badge>
        <JobsPagination
          query={query}
          page={page}
          totalPages={totalPages}
          className="mx-0 w-auto"
        />
      </div>
    </div>
  );
}
