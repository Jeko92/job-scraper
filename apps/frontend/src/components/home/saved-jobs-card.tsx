import Link from 'next/link';

import { getSavedJobs } from '@/lib/home/data';
import { formatJobMeta, formatPostedAt } from '@/lib/jobs/format';
import { jobHref, SAVED_HREF } from '@/lib/routes';
import { textLink } from '@/lib/styles';
import { cn } from '@/lib/utils';

import { HomeCard } from './home-card';
import { LoadError } from './load-error';

export async function SavedJobsCard() {
  const savedJobs = await getSavedJobs();

  return (
    <HomeCard
      title="Saved jobs"
      action={{ label: 'View all', href: SAVED_HREF }}
    >
      {savedJobs === null ? (
        <LoadError subject="Your saved jobs" />
      ) : savedJobs.length > 0 ? (
        <ul>
          {savedJobs.map((job) => (
            <li
              key={job.id}
              className="flex items-center gap-3 border-t border-line py-3 last:border-b"
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  href={jobHref(job.id)}
                  className={cn(
                    textLink,
                    'truncate text-[15px] leading-5 text-ink',
                  )}
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
