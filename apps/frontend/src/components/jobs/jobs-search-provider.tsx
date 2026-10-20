'use client';

import type { JobsQuery } from '@job-scraper/shared';
import { useRouter } from 'next/navigation';
import {
  createContext,
  type ReactNode,
  useContext,
  useOptimistic,
  useTransition,
} from 'react';

import { toJobsSearchParams } from '@/lib/jobs/search-params';
import { SEARCH_HREF } from '@/lib/routes';
import { cn } from '@/lib/utils';

interface JobsSearchContextValue {
  /** Shows a new filter right away, before the page has reloaded. */
  query: JobsQuery;
  isPending: boolean;
  applyQuery: (query: JobsQuery) => void;
}

const JobsSearchContext = createContext<JobsSearchContextValue | null>(null);

interface JobsSearchProviderProps {
  query: JobsQuery;
  children: ReactNode;
}

/** Keeps the filters in the URL; the server page re-renders on each change. */
export function JobsSearchProvider({
  query,
  children,
}: JobsSearchProviderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticQuery, setOptimisticQuery] = useOptimistic(query);

  function applyQuery(next: JobsQuery) {
    const qs = toJobsSearchParams({ ...next, cursor: undefined }).toString();
    startTransition(() => {
      setOptimisticQuery(next);
      router.replace(qs === '' ? SEARCH_HREF : `${SEARCH_HREF}?${qs}`, {
        scroll: false,
      });
    });
  }

  return (
    <JobsSearchContext
      value={{ query: optimisticQuery, isPending, applyQuery }}
    >
      {children}
    </JobsSearchContext>
  );
}

export function useJobsSearch(): JobsSearchContextValue {
  const value = useContext(JobsSearchContext);
  if (value === null) {
    throw new Error('useJobsSearch must be used inside JobsSearchProvider');
  }
  return value;
}

interface JobsResultsProps {
  children: ReactNode;
}

/** Dims the results while new ones load. */
export function JobsResults({ children }: JobsResultsProps) {
  const { isPending } = useJobsSearch();
  return (
    <div
      aria-busy={isPending}
      className={cn(
        'flex min-w-0 flex-col gap-4 transition-opacity',
        isPending && 'opacity-60',
      )}
    >
      {children}
    </div>
  );
}
