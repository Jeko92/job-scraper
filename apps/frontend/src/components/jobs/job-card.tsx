import type { JobListItem } from '@job-scraper/shared';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  formatJobMeta,
  formatJobSalary,
  formatJobSkills,
  formatPostedAt,
} from '@/lib/jobs/format';
import { jobHref } from '@/lib/routes';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: JobListItem;
  headingLevel?: 'h2' | 'h3';
  className?: string;
}

export function JobCard({
  job,
  headingLevel: Heading = 'h2',
  className,
}: JobCardProps) {
  const salary = formatJobSalary(job);
  const skills = formatJobSkills(job);

  return (
    <Card
      className={cn(
        'gap-6 rounded-card p-6 ring-line transition-shadow duration-200 focus-within:shadow-lg hover:shadow-lg hover:ring-ink/20',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <Heading className="text-xl font-medium text-ink">
            <Link
              href={jobHref(job.id)}
              className="rounded-sm underline-offset-4 outline-none hover:underline focus-visible:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {job.title}
            </Link>
          </Heading>
          <p className="text-sm text-ink-muted">{formatJobMeta(job)}</p>
          {salary && <p className="text-sm text-ink">{salary}</p>}
        </div>
        {/* Relative time differs between server and browser by a few seconds. */}
        <time
          dateTime={job.postedAt}
          suppressHydrationWarning
          className="shrink-0 text-sm text-ink-muted"
        >
          {formatPostedAt(job.postedAt)}
        </time>
      </div>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-ink-muted">{skills}</p>
        <Link
          href={jobHref(job.id)}
          aria-label={`View details for ${job.title}`}
          className={cn(
            buttonVariants({ size: 'lg' }),
            'ml-auto rounded-pill px-4 font-semibold',
          )}
        >
          View details
        </Link>
      </div>
    </Card>
  );
}
