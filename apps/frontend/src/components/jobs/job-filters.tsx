'use client';

import {
  EMPLOYMENT_TYPES,
  MAX_FILTER_VALUES,
  REMOTE_PREFERENCES,
} from '@job-scraper/shared';
import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';

import { LogoMark } from '@/components/brand/logo';
import { FieldSelect } from '@/components/forms/field-select';
import { LookupFilter } from '@/components/lookups/lookup-filter';
import { Checkbox } from '@/components/ui/checkbox';
import {
  EMPLOYMENT_TYPE_LABELS,
  formatPostedWithin,
  POSTED_WITHIN_OPTIONS,
  REMOTE_PREFERENCE_LABELS,
} from '@/lib/jobs/format';
import {
  addFilterValue,
  removeFilterValue,
  toggleFilterValue,
} from '@/lib/jobs/query-filters';
import {
  searchLocationOptions,
  searchSkillOptions,
} from '@/lib/lookups/actions';
import type { LookupOption } from '@/lib/lookups/types';
import { overline } from '@/lib/styles';
import { cn } from '@/lib/utils';

import { useJobsSearch } from './jobs-search-provider';

export function JobFilters() {
  const { query, applyQuery, labelFor, rememberLabel } = useJobsSearch();
  const [open, setOpen] = useState(false);
  const bodyId = useId();

  function toOptions(values: string[] | undefined): LookupOption[] {
    return (values ?? []).map((value) => ({ value, label: labelFor(value) }));
  }

  const filtersPill = (
    <span className="inline-flex items-center gap-2 rounded-chip border border-line px-3 py-1.5 text-sm text-ink shadow-sm">
      <LogoMark className="size-4" />
      Filters
    </span>
  );

  return (
    <aside
      aria-label="Job filters"
      className="flex flex-col gap-6 rounded-tile border border-line bg-surface p-6"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Phones: the whole header opens and closes the filters. */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => {
            setOpen((current) => !current);
          }}
          className="flex flex-1 items-center justify-between gap-3 text-ink lg:hidden"
        >
          {filtersPill}
          <ChevronDown
            className={cn('size-5 transition-transform', open && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
        <div className="hidden lg:block">{filtersPill}</div>
        <button
          type="button"
          onClick={() => {
            applyQuery({ sort: query.sort, page: 1, limit: query.limit });
          }}
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          Reset
        </button>
      </div>

      <div
        id={bodyId}
        className={cn('flex-col gap-6', open ? 'flex' : 'hidden lg:flex')}
      >
        <LookupFilter
          legend="Skills"
          placeholder="e.g. React"
          selected={toOptions(query.skill)}
          max={MAX_FILTER_VALUES}
          search={searchSkillOptions}
          onAdd={(option) => {
            rememberLabel(option);
            applyQuery(addFilterValue(query, 'skill', option.value));
          }}
          onRemove={(slug) => {
            applyQuery(removeFilterValue(query, 'skill', slug));
          }}
        />
        <LookupFilter
          legend="Locations"
          placeholder="e.g. Berlin"
          selected={toOptions(query.locationId)}
          max={MAX_FILTER_VALUES}
          search={searchLocationOptions}
          onAdd={(option) => {
            rememberLabel(option);
            applyQuery(addFilterValue(query, 'locationId', option.value));
          }}
          onRemove={(id) => {
            applyQuery(removeFilterValue(query, 'locationId', id));
          }}
        />
        <CheckboxGroup
          legend="Work mode"
          options={REMOTE_PREFERENCES.map((value) => ({
            value,
            label: REMOTE_PREFERENCE_LABELS[value],
          }))}
          selected={query.workplaceType}
          onToggle={(value) => {
            applyQuery(toggleFilterValue(query, 'workplaceType', value));
          }}
        />
        <CheckboxGroup
          legend="Contract"
          options={EMPLOYMENT_TYPES.map((value) => ({
            value,
            label: EMPLOYMENT_TYPE_LABELS[value],
          }))}
          selected={query.employmentType}
          onToggle={(value) => {
            applyQuery(toggleFilterValue(query, 'employmentType', value));
          }}
        />
        <PostedWithinSelect
          value={query.postedWithinDays}
          onChange={(postedWithinDays) => {
            applyQuery({ ...query, postedWithinDays });
          }}
        />
      </div>
    </aside>
  );
}

interface CheckboxGroupProps<T extends string> {
  legend: string;
  options: { value: T; label: string }[];
  selected: T[] | undefined;
  onToggle: (value: T) => void;
}

function CheckboxGroup<T extends string>({
  legend,
  options,
  selected,
  onToggle,
}: CheckboxGroupProps<T>) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className={cn(overline, 'mb-3 text-ink-muted')}>{legend}</legend>
      {options.map(({ value, label }) => (
        <label
          key={value}
          className="flex cursor-pointer items-center gap-3 text-sm text-ink"
        >
          <Checkbox
            checked={selected?.includes(value) ?? false}
            onCheckedChange={() => {
              onToggle(value);
            }}
            className="size-5 rounded-md border-line"
          />
          {label}
        </label>
      ))}
    </fieldset>
  );
}

interface PostedWithinSelectProps {
  /** Days; undefined means any time. */
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

function PostedWithinSelect({ value, onChange }: PostedWithinSelectProps) {
  // Keep a value from the URL selectable even when it is not a preset.
  const days: readonly number[] =
    value === undefined || POSTED_WITHIN_OPTIONS.some((day) => day === value)
      ? POSTED_WITHIN_OPTIONS
      : [...POSTED_WITHIN_OPTIONS, value].sort((a, b) => a - b);
  const items = [
    { value: null, label: 'Any time' },
    ...days.map((day) => ({ value: day, label: formatPostedWithin(day) })),
  ];

  return (
    <FieldSelect
      label="Posted"
      items={items}
      value={value ?? null}
      onChange={(next) => {
        onChange(next ?? undefined);
      }}
    />
  );
}
