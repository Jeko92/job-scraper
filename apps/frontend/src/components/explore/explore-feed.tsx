import type { JobsPreviewResponse } from '@job-scraper/shared';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { GlowPanel } from '@/components/landing/glow-panel';
import { Card } from '@/components/ui/card';
import { formatJobCount } from '@/lib/jobs/format';
import { REGISTER_HREF } from '@/lib/routes';

import { ExploreJobCard } from './explore-job-card';

interface ExploreFeedProps {
  result: JobsPreviewResponse;
}

/** The prospect version of the search results: header, cards, "Load more". */
export function ExploreFeed({ result }: ExploreFeedProps) {
  const { items, total } = result;

  return (
    <section aria-labelledby="jobs-heading" className="flex flex-col gap-4">
      <GlowPanel className="flex flex-col gap-2 rounded-tile border border-line bg-surface p-6 sm:p-8">
        <h1 id="jobs-heading" className="font-heading text-4xl text-ink">
          {formatJobCount(total)} {total === 1 ? 'open role' : 'open roles'}
        </h1>
        <p className="text-ink-muted">
          A first look at the newest jobs. Sign up to see them all, matched to
          your profile.
        </p>
      </GlowPanel>

      {items.length === 0 ? (
        <Card className="items-center gap-2 rounded-card p-10 text-center ring-line">
          <p className="font-heading text-2xl text-ink">No jobs match yet</p>
          <p className="text-sm text-ink-muted">
            Try removing a filter or widening your search.
          </p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((job) => (
            <li key={job.id}>
              <ExploreJobCard job={job} />
            </li>
          ))}
        </ul>
      )}

      <LoadMoreCta hiddenCount={total - items.length} />
    </section>
  );
}

interface LoadMoreCtaProps {
  /** Matching jobs not shown in the preview. */
  hiddenCount: number;
}

/** Instead of pagination: the rest of the jobs come with an account. */
function LoadMoreCta({ hiddenCount }: LoadMoreCtaProps) {
  return (
    <div className="flex flex-col items-center gap-3 pt-6 text-center">
      <Link
        href={REGISTER_HREF}
        className="group inline-flex h-16 items-center justify-center gap-3 rounded-pill bg-primary px-10 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/85 hover:shadow-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:h-20 sm:px-14 sm:text-xl"
      >
        Load more
        <ArrowRight
          className="size-6 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>
      <p className="text-sm text-ink-muted">
        {hiddenCount > 0
          ? `${formatJobCount(hiddenCount)} more ${hiddenCount === 1 ? 'job' : 'jobs'} waiting. Sign up free to see them all.`
          : 'Sign up free to get new jobs matched to you.'}
      </p>
    </div>
  );
}
