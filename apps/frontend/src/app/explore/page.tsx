import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ExploreFeed } from '@/components/explore/explore-feed';
import { ExploreFilters } from '@/components/explore/explore-filters';
import { getSession } from '@/lib/auth/session';
import { fetchJobsPreview } from '@/lib/explore/api';
import { explorePageHref, parsePreviewQuery } from '@/lib/explore/query-url';
import { jobsPageHref, parseJobsQuery } from '@/lib/jobs/query-url';

export const metadata: Metadata = { title: 'Explore jobs' };

/** A teaser of the search page for prospects (not logged in). */
export default async function ExplorePage({
  searchParams,
}: PageProps<'/explore'>) {
  const params = await searchParams;
  if (await getSession()) {
    // Cities have no location id here, so only the skills carry over.
    redirect(jobsPageHref(parseJobsQuery({ skill: params['skill'] }), 1));
  }

  const query = parsePreviewQuery(params);
  // Clean up the URL, e.g. `?skill=&city=` from the hero's "Any" options.
  const href = explorePageHref(query);
  if (Object.values(params).some((value) => value === '')) {
    redirect(href);
  }
  // A failing request reaches error.tsx.
  const preview = await fetchJobsPreview(query);

  return (
    <main className="flex-1 px-4 pb-12 sm:px-8">
      <ExploreFilters query={query}>
        <ExploreFeed result={preview} />
      </ExploreFilters>
    </main>
  );
}
