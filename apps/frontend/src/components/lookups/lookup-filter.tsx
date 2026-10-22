'use client';

import { useEffect, useId, useState } from 'react';

import { Input } from '@/components/ui/input';
import type { LookupOption, LookupSearchResult } from '@/lib/lookups/types';
import { field, fieldLabel, overline } from '@/lib/styles';
import { cn } from '@/lib/utils';

import { FilterChip } from './filter-chip';

const SEARCH_DELAY_MS = 250;

interface LookupFilterProps {
  /** Group title, also used for the search label: "Skills" → "Search skills". */
  legend: string;
  /** Example inside the search box, e.g. "e.g. React". */
  placeholder: string;
  /** Selected values (skill slugs, location ids) with their labels. */
  selected: LookupOption[];
  /** "+ Add" disappears once this many values are selected. */
  max: number;
  /** Server action that finds values by name, e.g. `searchSkillOptions`. */
  search: (text: string) => Promise<LookupSearchResult>;
  onAdd: (option: LookupOption) => void;
  onRemove: (value: string) => void;
}

/**
 * Selected values as chips, plus "+ Add" with a search for more. Holds only
 * its own search state; the caller owns the selection.
 */
export function LookupFilter({
  legend,
  placeholder,
  selected,
  max,
  search,
  onAdd,
  onRemove,
}: LookupFilterProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [results, setResults] = useState<LookupOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchedFor, setSearchedFor] = useState('');
  const inputId = useId();

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
      : results.filter(
          (option) => !selected.some((item) => item.value === option.value),
        );
  const searched = term !== '' && searchedFor === term && error === null;
  // Read out by screen readers whenever a search finishes.
  const status = !searched
    ? ''
    : suggestions.length === 0
      ? 'No matches'
      : `${String(suggestions.length)} ${suggestions.length === 1 ? 'suggestion' : 'suggestions'}`;

  function close() {
    setOpen(false);
    setText('');
    setResults([]);
    setError(null);
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className={cn(overline, 'mb-3 text-ink-muted')}>{legend}</legend>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((option) => (
            <FilterChip
              key={option.value}
              variant="selected"
              label={option.label}
              onClick={() => {
                onRemove(option.value);
              }}
            />
          ))}
        </div>
      )}

      {selected.length >= max ? (
        <p className="text-sm text-ink-muted">
          Up to {max} {legend.toLowerCase()}. Remove one to add another.
        </p>
      ) : open ? (
        <div className="flex flex-col gap-3">
          <label htmlFor={inputId} className={fieldLabel}>
            Search {legend.toLowerCase()}
          </label>
          <Input
            id={inputId}
            autoFocus
            value={text}
            placeholder={placeholder}
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
                    onAdd(option);
                    setText('');
                  }}
                />
              ))}
            </div>
          )}
          <p aria-live="polite" className="sr-only">
            {status}
          </p>
          {searched && suggestions.length === 0 && (
            <p aria-hidden="true" className="text-sm text-ink-muted">
              No matches.
            </p>
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
