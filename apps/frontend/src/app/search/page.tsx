import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { JobsFeed } from '@/components/jobs/jobs-feed';
import { Card } from '@/components/ui/card';
import { getSession } from '@/lib/auth/session';
import { fetchJobsPage } from '@/lib/jobs/api';
import { formatJobCount } from '@/lib/jobs/format';
import { parseJobsQuery, toJobsSearchParams } from '@/lib/jobs/search-params';
import { LOGIN_HREF } from '@/lib/routes';

export const metadata: Metadata = { title: 'Search' };

export default async function SearchPage({
  searchParams,
}: PageProps<'/search'>) {
  if (!(await getSession())) {
    redirect(LOGIN_HREF);
  }

  const query = parseJobsQuery(await searchParams);
  const firstPage = await fetchJobsPage(query).catch(() => null);

  return (
    <main className="flex-1 px-4 pb-12 sm:px-8">
      <section aria-labelledby="jobs-heading" className="flex flex-col gap-4">
        <h1 id="jobs-heading" className="font-heading text-4xl text-ink">
          {firstPage
            ? `${formatJobCount(firstPage.total)} ${firstPage.total === 1 ? 'match' : 'matches'}`
            : 'Search'}
        </h1>
        {firstPage ? (
          // A new query string starts a fresh list.
          <JobsFeed
            key={toJobsSearchParams(query).toString()}
            query={query}
            initialPage={firstPage}
          />
        ) : (
          <Card className="gap-2 rounded-card p-10 text-center ring-line">
            <p className="font-heading text-2xl text-ink">
              Jobs are not available right now
            </p>
            <p className="text-sm text-ink-muted">
              We could not load jobs. Please try again in a moment.
            </p>
          </Card>
        )}
      </section>
    </main>
  );
}
