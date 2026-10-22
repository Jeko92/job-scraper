'use client';

import { JOB_SORTS, type JobsQuery } from '@job-scraper/shared';
import { SlidersHorizontal } from 'lucide-react';

import { FieldSelect } from '@/components/forms/field-select';
import { GlowPanel } from '@/components/landing/glow-panel';
import { FilterChip } from '@/components/lookups/filter-chip';
import {
  EMPLOYMENT_TYPE_LABELS,
  formatJobCount,
  formatPostedWithin,
  JOB_SORT_LABELS,
  REMOTE_PREFERENCE_LABELS,
} from '@/lib/jobs/format';
import { removeFilterValue } from '@/lib/jobs/query-filters';

import { useJobsSearch } from './jobs-search-provider';

const SORT_ITEMS = JOB_SORTS.map((sort) => ({
  value: sort,
  label: JOB_SORT_LABELS[sort],
}));

interface JobsHeaderProps {
  total: number;
}

export function JobsHeader({ total }: JobsHeaderProps) {
  const { query, applyQuery, labelFor } = useJobsSearch();
  const filters = getActiveFilters(query, labelFor);
  const locationCount = query.locationId?.length ?? 0;

  return (
    <GlowPanel className="flex flex-col gap-6 rounded-tile border border-line bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 id="jobs-heading" className="font-heading text-4xl text-ink">
            {formatJobCount(total)} {total === 1 ? 'match' : 'matches'}
          </h1>
          {locationCount > 0 && (
            <p className="text-ink-muted">
              in {locationCount}{' '}
              {locationCount === 1 ? 'location' : 'locations'}
            </p>
          )}
        </div>
        <FieldSelect
          label="Sort by"
          items={SORT_ITEMS}
          value={query.sort}
          onChange={(sort) => {
            applyQuery({ ...query, sort: sort ?? 'newest' });
          }}
          className="w-full sm:w-60"
        />
      </div>

      {filters.length > 0 && (
        <div
          role="group"
          aria-label="Active filters"
          className="flex flex-wrap items-center gap-2"
        >
          <SlidersHorizontal
            className="size-5 text-ink-muted"
            aria-hidden="true"
          />
          {filters.map((filter) => (
            <FilterChip
              key={filter.key}
              variant="selected"
              label={filter.label}
              onClick={() => {
                applyQuery(filter.without);
              }}
            />
          ))}
        </div>
      )}
    </GlowPanel>
  );
}

interface ActiveFilter {
  key: string;
  label: string;
  /** The query after removing this filter. */
  without: JobsQuery;
}

function getActiveFilters(
  query: JobsQuery,
  labelFor: (value: string) => string,
): ActiveFilter[] {
  const filters: ActiveFilter[] = [
    // Skills first: they are the main search criterion.
    ...(query.skill ?? []).map((slug) => ({
      key: `skill:${slug}`,
      label: labelFor(slug),
      without: removeFilterValue(query, 'skill', slug),
    })),
    ...(query.locationId ?? []).map((id) => ({
      key: `locationId:${id}`,
      label: labelFor(id),
      without: removeFilterValue(query, 'locationId', id),
    })),
    ...(query.workplaceType ?? []).map((value) => ({
      key: `workplaceType:${value}`,
      label: REMOTE_PREFERENCE_LABELS[value],
      without: removeFilterValue(query, 'workplaceType', value),
    })),
    ...(query.employmentType ?? []).map((value) => ({
      key: `employmentType:${value}`,
      label: EMPLOYMENT_TYPE_LABELS[value],
      without: removeFilterValue(query, 'employmentType', value),
    })),
  ];
  if (query.postedWithinDays !== undefined) {
    filters.push({
      key: 'postedWithinDays',
      label: formatPostedWithin(query.postedWithinDays),
      without: { ...query, postedWithinDays: undefined },
    });
  }
  return filters;
}
