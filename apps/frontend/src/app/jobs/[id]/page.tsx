import { jobIdSchema } from '@job-scraper/shared';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';

import { JobDetail } from '@/components/jobs/job-detail';
import { getSession } from '@/lib/auth/session';
import { fetchJobDetail } from '@/lib/jobs/api';
import { LOGIN_HREF } from '@/lib/routes';

// generateMetadata and the page share one backend request per render.
// An id that is no UUID can't be a job, so it never reaches the backend.
const loadJob = cache(async (id: string) =>
  jobIdSchema.safeParse(id).success ? fetchJobDetail(id) : null,
);

export async function generateMetadata({
  params,
}: PageProps<'/jobs/[id]'>): Promise<Metadata> {
  if (!(await getSession())) {
    return {};
  }
  const job = await loadJob((await params).id);
  return { title: job?.title ?? 'Job not found' };
}

export default async function JobDetailPage({
  params,
}: PageProps<'/jobs/[id]'>) {
  if (!(await getSession())) {
    redirect(LOGIN_HREF);
  }

  const job = await loadJob((await params).id);
  if (!job) {
    notFound();
  }

  return (
    <main className="flex-1 px-4 pb-12 sm:px-8">
      <JobDetail job={job} />
    </main>
  );
}
