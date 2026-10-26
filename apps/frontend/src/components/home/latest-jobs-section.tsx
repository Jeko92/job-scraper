import type { JobListItem } from '@job-scraper/shared';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { SEARCH_HREF } from '@/lib/routes';
import { sectionHeading, textLink } from '@/lib/styles';
import { cn } from '@/lib/utils';

import { JobsSlider } from './jobs-slider';

interface LatestJobsSectionProps {
  jobs: JobListItem[] | null;
}

export function LatestJobsSection({ jobs }: LatestJobsSectionProps) {
  return (
    <section
      aria-labelledby="latest-jobs"
      className="flex flex-col gap-5 overflow-hidden rounded-tile border border-line bg-surface p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="latest-jobs" className={sectionHeading}>
            Latest jobs
          </h2>
          <p className="text-sm text-ink-muted">
            The newest roles from company career pages. The full list lives in
            Search.
          </p>
        </div>
        <Link
          href={SEARCH_HREF}
          className={cn(
            textLink,
            'inline-flex items-center gap-1.5 text-sm font-semibold text-ink',
          )}
        >
          See all in Search
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {jobs === null ? (
        <p className="text-ink-muted">
          Jobs could not be loaded right now. Please try again later.
        </p>
      ) : jobs.length > 0 ? (
        <JobsSlider jobs={jobs} />
      ) : (
        <p className="text-ink-muted">No jobs yet. Check back soon.</p>
      )}
    </section>
  );
}
