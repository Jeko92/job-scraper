'use client';

import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import type { LookupSearchResult } from '@/lib/jobs/actions';
import type { LookupOption } from '@/lib/jobs/lookups';
import { field, overline } from '@/lib/styles';
import { cn } from '@/lib/utils';

import { FilterChip } from './filter-chip';
import { useJobsSearch } from './jobs-search-provider';

const SEARCH_DELAY_MS = 250;

interface LookupFilterProps {
  legend: string;
  placeholder: string;
  /** Selected values: skill slugs, location ids. */
  values: string[] | undefined;
  /** "+ Add" disappears once this many values are selected. */
  max: number;
  /** Server action that finds values by name. */
  search: (text: string) => Promise<LookupSearchResult>;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}

/** Selected values as chips, plus "+ Add" with a search for more. */
export function LookupFilter({
  legend,
  placeholder,
  values = [],
  max,
  search,
  onAdd,
  onRemove,
}: LookupFilterProps) {
  const { labelFor, rememberLabel } = useJobsSearch();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [results, setResults] = useState<LookupOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchedFor, setSearchedFor] = useState('');

  const term = text.trim();

  useEffect(() => {
    if (!open || term === '') {
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      void search(term).then((result) => {
        if (cancelled) {
          return;
        }
        if ('error' in result) {
          setError(result.error);
          setResults([]);
        } else {
          setError(null);
          setResults(result.options);
        }
        setSearchedFor(term);
      });
    }, SEARCH_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, term, search]);

  const suggestions =
    term === ''
      ? []
      : results.filter((option) => !values.includes(option.value));

  function close() {
    setOpen(false);
    setText('');
    setResults([]);
    setError(null);
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className={cn(overline, 'mb-3 text-ink-muted')}>{legend}</legend>

      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <FilterChip
              key={value}
              variant="selected"
              label={labelFor(value)}
              onClick={() => {
                onRemove(value);
              }}
            />
          ))}
        </div>
      )}

      {values.length >= max ? (
        <p className="text-sm text-ink-muted">
          Up to {max} {legend.toLowerCase()}. Remove one to add another.
        </p>
      ) : open ? (
        <div className="flex flex-col gap-3">
          <Input
            autoFocus
            value={text}
            placeholder={placeholder}
            aria-label={placeholder}
            onChange={(event) => {
              setText(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                close();
              }
            }}
            className={cn(field, 'h-12 text-base md:text-base')}
          />
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((option) => (
                <FilterChip
                  key={option.value}
                  variant="add"
                  label={option.label}
                  onClick={() => {
                    rememberLabel(option);
                    onAdd(option.value);
                    setText('');
                  }}
                />
              ))}
            </div>
          )}
          {term !== '' &&
            searchedFor === term &&
            error === null &&
            suggestions.length === 0 && (
              <p className="text-sm text-ink-muted">No matches.</p>
            )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={close}
            className="self-start text-sm text-ink-muted transition-colors hover:text-ink"
          >
            Done
          </button>
        </div>
      ) : (
        <div>
          <FilterChip
            variant="add"
            label="Add"
            ariaLabel={`Add ${legend.toLowerCase()}`}
            onClick={() => {
              setOpen(true);
            }}
          />
        </div>
      )}
    </fieldset>
  );
}
