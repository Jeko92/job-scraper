'use client';

import {
  type JobsPreviewQuery,
  PREVIEW_CITIES,
  PREVIEW_SKILL_LABELS,
  PREVIEW_SKILLS,
} from '@job-scraper/shared';
import { useRouter } from 'next/navigation';
import { type ReactNode, useOptimistic, useTransition } from 'react';

import { LogoMark } from '@/components/brand/logo';
import { FilterChip } from '@/components/lookups/filter-chip';
import { explorePageHref } from '@/lib/explore/query-url';
import { overline } from '@/lib/styles';
import { cn } from '@/lib/utils';

interface ExploreFiltersProps {
  query: JobsPreviewQuery;
  /** The results; dimmed while the page reloads with new filters. */
  children: ReactNode;
}

/**
 * The prospect version of `JobFilters`: only skills and cities, picked from
 * fixed lists. Keeps the filters in the URL; the server page re-renders.
 */
export function ExploreFilters({ query, children }: ExploreFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticQuery, setOptimisticQuery] = useOptimistic(query);

  function applyQuery(next: JobsPreviewQuery) {
    startTransition(() => {
      setOptimisticQuery(next);
      router.push(explorePageHref(next), { scroll: false });
    });
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside
        aria-label="Job filters"
        className="flex flex-col gap-6 rounded-tile border border-line bg-surface p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 rounded-chip border border-line px-3 py-1.5 text-sm text-ink shadow-sm">
            <LogoMark className="size-4" />
            Filters
          </span>
          <button
            type="button"
            onClick={() => {
              applyQuery({});
            }}
            className="text-sm text-ink-muted transition-colors hover:text-ink"
          >
            Reset
          </button>
        </div>

        <ChipGroup
          legend="Skills"
          options={PREVIEW_SKILLS.map((value) => ({
            value,
            label: PREVIEW_SKILL_LABELS[value],
          }))}
          selected={optimisticQuery.skill}
          onChange={(skill) => {
            applyQuery({ ...optimisticQuery, skill });
          }}
        />
        <ChipGroup
          legend="Locations"
          options={PREVIEW_CITIES.map((value) => ({ value, label: value }))}
          selected={optimisticQuery.city}
          onChange={(city) => {
            applyQuery({ ...optimisticQuery, city });
          }}
        />
      </aside>

      <div
        aria-busy={isPending}
        className={cn(
          'flex min-w-0 flex-col gap-4 transition-opacity',
          isPending && 'opacity-60',
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface ChipGroupProps<T extends string> {
  legend: string;
  options: { value: T; label: string }[];
  selected: T[] | undefined;
  /** Undefined once the last value is removed, so it drops from the URL. */
  onChange: (selected: T[] | undefined) => void;
}

function ChipGroup<T extends string>({
  legend,
  options,
  selected = [],
  onChange,
}: ChipGroupProps<T>) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className={cn(overline, 'mb-3 text-ink-muted')}>{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(({ value, label }) =>
          selected.includes(value) ? (
            <FilterChip
              key={value}
              variant="selected"
              label={label}
              onClick={() => {
                const rest = selected.filter((item) => item !== value);
                onChange(rest.length > 0 ? rest : undefined);
              }}
            />
          ) : (
            <FilterChip
              key={value}
              variant="add"
              label={label}
              onClick={() => {
                onChange([...selected, value]);
              }}
            />
          ),
        )}
      </div>
    </fieldset>
  );
}
