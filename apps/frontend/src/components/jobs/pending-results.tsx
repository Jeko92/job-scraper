'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { useJobsSearch } from './jobs-search-provider';

interface PendingResultsProps {
  children: ReactNode;
}

export function PendingResults({ children }: PendingResultsProps) {
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
