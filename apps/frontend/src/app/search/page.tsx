import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { JobFilters } from '@/components/jobs/job-filters';
import { JobsFeed } from '@/components/jobs/jobs-feed';
import { JobsHeader } from '@/components/jobs/jobs-header';
import { JobsSearchProvider } from '@/components/jobs/jobs-search-provider';
import { PendingResults } from '@/components/jobs/pending-results';
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
  // A failing jobs request reaches error.tsx; missing chip labels only fall
  // back to the raw value.
  const [jobsPage, skills, locations] = await Promise.all([
    fetchJobsPage(query),
    fetchSkillsBySlugs(query.skill).catch(() => []),
    fetchLocationsByIds(query.locationId).catch(() => []),
  ]);
  // A page past the end, e.g. from an old link: show the last page instead.
  if (jobsPage.totalPages > 0 && query.page > jobsPage.totalPages) {
    redirect(jobsPageHref(query, jobsPage.totalPages));
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
          <PendingResults>
            <section
              aria-labelledby="jobs-heading"
              className="flex flex-col gap-4"
            >
              <JobsHeader total={jobsPage.total} />
              <JobsFeed query={query} result={jobsPage} />
            </section>
          </PendingResults>
        </div>
      </JobsSearchProvider>
    </main>
  );
}
