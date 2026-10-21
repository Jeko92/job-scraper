'use client';

import type { JobsListResponse, JobsQuery } from '@job-scraper/shared';
import { useState, useTransition } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { loadMoreJobs } from '@/lib/jobs/actions';
import { formatJobCount } from '@/lib/jobs/format';

import { JobCard } from './job-card';
import { JobCardSkeleton } from './job-card-skeleton';

interface JobsFeedProps {
  query: JobsQuery;
  initialPage: JobsListResponse;
}

export function JobsFeed({ query, initialPage }: JobsFeedProps) {
  const [items, setItems] = useState(initialPage.items);
  const [page, setPage] = useState(initialPage.page);
  const [totalPages, setTotalPages] = useState(initialPage.totalPages);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  const hasMore = page < totalPages;

  function loadMore() {
    if (!hasMore) {
      return;
    }
    startTransition(async () => {
      const result = await loadMoreJobs(query, page + 1);
      startTransition(() => {
        if ('error' in result) {
          setError(result.error);
          return;
        }
        setError(null);
        // Offset paging: a job added meanwhile could repeat, so skip known ids.
        setItems((current) => {
          const seen = new Set(current.map((job) => job.id));
          return [
            ...current,
            ...result.items.filter((job) => !seen.has(job.id)),
          ];
        });
        setPage(result.page);
        setTotalPages(result.totalPages);
      });
    });
  }

  const shown = formatJobCount(items.length);

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {items.map((job) => (
          <li key={job.id}>
            <JobCard job={job} />
          </li>
        ))}
      </ul>
      {isPending && <JobCardSkeleton />}

      <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
        <Badge
          aria-live="polite"
          className="h-7 bg-highlight px-3 text-on-highlight"
        >
          {hasMore
            ? `Showing ${shown} of ${formatJobCount(initialPage.total)}`
            : `Showing all ${shown}`}
        </Badge>
        {hasMore && (
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isPending}
            className="h-11 rounded-pill px-5 font-semibold text-ink"
          >
            {isPending ? 'Loading…' : error ? 'Try again' : 'Load more'}
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-center text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
