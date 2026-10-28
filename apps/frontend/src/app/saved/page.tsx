import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { JobsFeed } from '@/components/jobs/jobs-feed';
import { GlowPanel } from '@/components/landing/glow-panel';
import { buttonVariants } from '@/components/ui/button';
import { getSession } from '@/lib/auth/session';
import { fetchJobsPage } from '@/lib/jobs/api';
import { formatJobCount } from '@/lib/jobs/format';
import { jobsPageHref, parseJobsQuery } from '@/lib/jobs/query-url';
import { LOGIN_HREF, SAVED_HREF, SEARCH_HREF } from '@/lib/routes';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Saved' };

export default async function SavedPage({ searchParams }: PageProps<'/saved'>) {
  if (!(await getSession())) {
    redirect(LOGIN_HREF);
  }

  const query = parseJobsQuery(await searchParams);
  const jobsPage = await fetchJobsPage({ ...query, saved: true });
  // A page past the end, e.g. after unsaving the last job on it.
  if (jobsPage.totalPages > 0 && query.page > jobsPage.totalPages) {
    redirect(jobsPageHref(query, jobsPage.totalPages, SAVED_HREF));
  }

  return (
    <main className="flex-1 px-4 pb-12 sm:px-8">
      <section
        aria-labelledby="saved-heading"
        className="mx-auto flex w-full max-w-4xl flex-col gap-4"
      >
        <GlowPanel className="flex flex-col gap-2 rounded-tile border border-line bg-surface p-6 sm:p-8">
          <h1 id="saved-heading" className="font-heading text-4xl text-ink">
            Saved jobs
          </h1>
          <p className="text-ink-muted">
            {formatJobCount(jobsPage.total)}{' '}
            {jobsPage.total === 1 ? 'job' : 'jobs'}
          </p>
        </GlowPanel>
        <JobsFeed
          query={query}
          result={jobsPage}
          basePath={SAVED_HREF}
          empty={
            <>
              <p className="font-heading text-2xl text-ink">
                No saved jobs yet
              </p>
              <p className="text-sm text-ink-muted">
                Save jobs from your search to find them here.
              </p>
              <Link
                href={SEARCH_HREF}
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'mt-2 rounded-pill px-4 font-semibold',
                )}
              >
                Search jobs
              </Link>
            </>
          }
        />
      </section>
    </main>
  );
}
