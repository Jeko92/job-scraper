import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { getBestMatchJobs } from '@/lib/home/data';
import { SEARCH_HREF } from '@/lib/routes';
import { sectionHeading, textLink } from '@/lib/styles';
import { cn } from '@/lib/utils';

import { JobsSliderSkeleton } from './home-skeletons';
import { JobsSlider } from './jobs-slider';

async function LatestJobs() {
  const jobs = await getBestMatchJobs();

  if (jobs === null) {
    return (
      <p className="text-ink-muted">
        Jobs could not be loaded right now. Please try again later.
      </p>
    );
  }
  if (jobs.length === 0) {
    return <p className="text-ink-muted">No jobs yet. Check back soon.</p>;
  }
  return <JobsSlider jobs={jobs} />;
}

export function LatestJobsSection() {
  return (
    <section
      aria-labelledby="latest-jobs"
      className="flex flex-col gap-5 overflow-hidden rounded-tile border border-line bg-surface p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="latest-jobs" className={sectionHeading}>
            Best matches for you
          </h2>
          <p className="text-sm text-ink-muted">
            Roles that fit your profile best. The full list lives in Search.
          </p>
        </div>
        <Link
          href={`${SEARCH_HREF}?sort=bestMatch`}
          className={cn(
            textLink,
            'inline-flex items-center gap-1.5 text-sm font-semibold text-ink',
          )}
        >
          See all in Search
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <Suspense fallback={<JobsSliderSkeleton />}>
        <LatestJobs />
      </Suspense>
    </section>
  );
}
