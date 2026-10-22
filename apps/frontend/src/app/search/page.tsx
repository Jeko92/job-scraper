import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { JobFilters } from '@/components/jobs/job-filters';
import { JobsFeed } from '@/components/jobs/jobs-feed';
import { JobsHeader } from '@/components/jobs/jobs-header';
import {
  JobsResults,
  JobsSearchProvider,
} from '@/components/jobs/jobs-search-provider';
import { Card } from '@/components/ui/card';
import { getSession } from '@/lib/auth/session';
import { fetchJobsPage } from '@/lib/jobs/api';
import { jobsPageHref, parseJobsQuery } from '@/lib/jobs/query-url';
import {
  fetchLocationsByIds,
  fetchSkillsBySlugs,
  toLocationOption,
} from '@/lib/lookups/api';
import { LOGIN_HREF } from '@/lib/routes';

export const metadata: Metadata = { title: 'Search' };

export default async function SearchPage({
  searchParams,
}: PageProps<'/search'>) {
  if (!(await getSession())) {
    redirect(LOGIN_HREF);
  }

  const query = parseJobsQuery(await searchParams);
  const [result, skills, locations] = await Promise.all([
    fetchJobsPage(query).catch(() => null),
    fetchSkillsBySlugs(query.skill).catch(() => []),
    fetchLocationsByIds(query.locationId).catch(() => []),
  ]);
  // A page past the end, e.g. from an old link: show the last page instead.
  if (result && result.totalPages > 0 && query.page > result.totalPages) {
    redirect(jobsPageHref(query, result.totalPages));
  }
  const labels = [
    ...skills.map((skill) => ({ value: skill.slug, label: skill.name })),
    ...locations.map(toLocationOption),
  ];

  return (
    <main className="flex-1 px-4 pb-12 sm:px-8">
      <JobsSearchProvider query={query} labels={labels}>
        <div className="grid items-start gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <JobFilters />
          <JobsResults>
            <section
              aria-labelledby="jobs-heading"
              className="flex flex-col gap-4"
            >
              <JobsHeader total={result?.total ?? null} />
              {result ? (
                <JobsFeed query={query} result={result} />
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
          </JobsResults>
        </div>
      </JobsSearchProvider>
    </main>
  );
}
