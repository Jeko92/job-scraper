'use client';

import type { JobsQuery } from '@job-scraper/shared';
import { useRouter } from 'next/navigation';
import {
  createContext,
  type ReactNode,
  useContext,
  useOptimistic,
  useState,
  useTransition,
} from 'react';

import { toJobsSearchParams } from '@/lib/jobs/query-url';
import type { LookupOption } from '@/lib/lookups/types';
import { SEARCH_HREF } from '@/lib/routes';
import { cn } from '@/lib/utils';

interface JobsSearchContextValue {
  /** Shows a new filter right away, before the page has reloaded. */
  query: JobsQuery;
  isPending: boolean;
  applyQuery: (query: JobsQuery) => void;
  /** Readable name for a lookup value (skill slug, location id); falls back to the value. */
  labelFor: (value: string) => string;
  /** Remembers the name of a value picked in the browser until the page reloads with it. */
  rememberLabel: (option: LookupOption) => void;
}

const JobsSearchContext = createContext<JobsSearchContextValue | null>(null);

interface JobsSearchProviderProps {
  query: JobsQuery;
  /** Names of the selected lookup values, loaded on the server. */
  labels: LookupOption[];
  children: ReactNode;
}

/** Keeps the filters in the URL; the server page re-renders on each change. */
export function JobsSearchProvider({
  query,
  labels,
  children,
}: JobsSearchProviderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticQuery, setOptimisticQuery] = useOptimistic(query);
  const [pickedLabels, setPickedLabels] = useState<Record<string, string>>({});

  function labelFor(value: string): string {
    return (
      pickedLabels[value] ??
      labels.find((option) => option.value === value)?.label ??
      value
    );
  }

  function rememberLabel(option: LookupOption) {
    setPickedLabels((current) => ({
      ...current,
      [option.value]: option.label,
    }));
  }

  function applyQuery(next: JobsQuery) {
    const qs = toJobsSearchParams({ ...next, page: 1 }).toString();
    startTransition(() => {
      setOptimisticQuery(next);
      router.replace(qs === '' ? SEARCH_HREF : `${SEARCH_HREF}?${qs}`, {
        scroll: false,
      });
    });
  }

  return (
    <JobsSearchContext
      value={{
        query: optimisticQuery,
        isPending,
        applyQuery,
        labelFor,
        rememberLabel,
      }}
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
