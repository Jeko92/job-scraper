'use client';

import { EMPLOYMENT_TYPES, REMOTE_PREFERENCES } from '@job-scraper/shared';
import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';

import { LogoMark } from '@/components/brand/logo';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  EMPLOYMENT_TYPE_LABELS,
  formatEuros,
  formatPostedWithin,
  POSTED_WITHIN_OPTIONS,
  SALARY_FROM_OPTIONS,
  WORKPLACE_TYPE_LABELS,
} from '@/lib/jobs/format';
import { toggleValue } from '@/lib/jobs/search-params';
import { field, fieldLabel, overline } from '@/lib/styles';
import { cn } from '@/lib/utils';

import { useJobsSearch } from './jobs-search-provider';

export function JobFilters() {
  const { query, applyQuery } = useJobsSearch();
  const [open, setOpen] = useState(false);
  const bodyId = useId();

  return (
    <aside
      aria-label="Job filters"
      className="flex flex-col gap-6 rounded-tile border border-line bg-surface p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-chip border border-line px-3 py-1.5 text-sm text-ink shadow-sm">
          <LogoMark className="size-4" />
          Filters
        </span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              applyQuery({ sort: query.sort, limit: query.limit });
            }}
            className="text-sm text-ink-muted transition-colors hover:text-ink"
          >
            Reset
          </button>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={bodyId}
            aria-label={open ? 'Hide filters' : 'Show filters'}
            onClick={() => {
              setOpen((current) => !current);
            }}
            className="text-ink lg:hidden"
          >
            <ChevronDown
              className={cn(
                'size-5 transition-transform',
                open && 'rotate-180',
              )}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div
        id={bodyId}
        className={cn('flex-col gap-6', open ? 'flex' : 'hidden lg:flex')}
      >
        <CheckboxGroup
          legend="Work mode"
          options={REMOTE_PREFERENCES.map((value) => ({
            value,
            label: WORKPLACE_TYPE_LABELS[value],
          }))}
          selected={query.workplaceType}
          onToggle={(value) => {
            applyQuery({
              ...query,
              workplaceType: toggleValue(query.workplaceType, value),
            });
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
            applyQuery({
              ...query,
              employmentType: toggleValue(query.employmentType, value),
            });
          }}
        />
        <NumberSelect
          label="Posted"
          anyLabel="Any time"
          value={query.postedWithinDays}
          options={POSTED_WITHIN_OPTIONS}
          format={formatPostedWithin}
          onChange={(postedWithinDays) => {
            applyQuery({ ...query, postedWithinDays });
          }}
        />
        <NumberSelect
          label="Salary from"
          anyLabel="Any salary"
          value={query.salaryMin}
          options={SALARY_FROM_OPTIONS}
          format={formatEuros}
          onChange={(salaryMin) => {
            applyQuery({ ...query, salaryMin });
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

interface NumberSelectProps {
  label: string;
  anyLabel: string;
  value: number | undefined;
  options: readonly number[];
  format: (value: number) => string;
  onChange: (value: number | undefined) => void;
}

function NumberSelect({
  label,
  anyLabel,
  value,
  options,
  format,
  onChange,
}: NumberSelectProps) {
  // Keep a value from the URL selectable even when it is not a preset.
  const values =
    value === undefined || options.includes(value)
      ? options
      : [...options, value].sort((a, b) => a - b);
  const items = [
    { value: null, label: anyLabel },
    ...values.map((option) => ({ value: option, label: format(option) })),
  ];
  const labelId = useId();

  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className={fieldLabel}>
        {label}
      </span>
      <Select
        items={items}
        value={value ?? null}
        onValueChange={(next) => {
          onChange(next ?? undefined);
        }}
      >
        <SelectTrigger
          aria-labelledby={labelId}
          className={cn(field, 'w-full text-base data-[size=default]:h-12')}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.label} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
