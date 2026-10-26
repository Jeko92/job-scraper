import type { JobListItem } from '@job-scraper/shared';
import Link from 'next/link';

import { formatJobMeta, formatPostedAt } from '@/lib/jobs/format';
import { jobHref, SAVED_HREF } from '@/lib/routes';

import { HomeCard } from './home-card';

interface SavedJobsCardProps {
  savedJobs: JobListItem[];
}

export function SavedJobsCard({ savedJobs }: SavedJobsCardProps) {
  return (
    <HomeCard
      title="Saved jobs"
      action={{ label: 'View all', href: SAVED_HREF }}
    >
      {savedJobs.length > 0 ? (
        <ul>
          {savedJobs.map((job) => (
            <li
              key={job.id}
              className="flex items-center gap-3 border-t border-line py-3 last:border-b"
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  href={jobHref(job.id)}
                  className="truncate rounded-sm text-[15px] leading-5 text-ink underline-offset-4 outline-none hover:underline focus-visible:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {job.title}
                </Link>
                <span className="truncate text-[13px] leading-[18px] text-ink-muted">
                  {formatJobMeta(job)}
                </span>
              </div>
              <time
                dateTime={job.postedAt}
                className="shrink-0 text-xs leading-5 text-ink-muted"
              >
                {formatPostedAt(job.postedAt)}
              </time>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">
          No saved jobs yet. Bookmark a role to keep it here.
        </p>
      )}
    </HomeCard>
  );
}
