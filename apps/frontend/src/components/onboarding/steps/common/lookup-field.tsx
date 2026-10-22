'use client';

import { Plus } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

import { FilterChip } from '@/components/lookups/filter-chip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { LookupOption, LookupSearchResult } from '@/lib/lookups/types';
import { field, fieldLabel, overline } from '@/lib/styles';
import { cn } from '@/lib/utils';

const SEARCH_DELAY_MS = 250;

interface LookupFieldProps {
  /** Label above the input, e.g. "Search skills". */
  label: string;
  placeholder: string;
  selected: LookupOption[];
  max: number;
  /** Module-level search from `lib/lookups/search`, so it keeps its identity. */
  search: (text: string) => Promise<LookupSearchResult>;
  onChange: (selected: LookupOption[]) => void;
  /** Show "1. …", "2. …" on the chips when the order is a priority. */
  numbered?: boolean;
  /** Search with an empty text too, to show suggestions before typing. */
  suggestWhenEmpty?: boolean;
  /** Off when another field on the card should get the focus first. */
  autoFocus?: boolean;
}

/**
 * The onboarding take on `LookupFilter`: the input stays open, and "Add"
 * (or Enter) takes the best match, so the next value can be typed right away.
 */
export function LookupField({
  label,
  placeholder,
  selected,
  max,
  search,
  onChange,
  numbered = false,
  suggestWhenEmpty = false,
  autoFocus = true,
}: LookupFieldProps) {
  const [text, setText] = useState('');
  const [results, setResults] = useState<LookupOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchedFor, setSearchedFor] = useState<string | null>(null);
  const inputId = useId();

  const term = text.trim();
  const isFull = selected.length >= max;
  const shouldSearch = term !== '' || suggestWhenEmpty;

  // Debounce: search once the user pauses typing; ignore outdated answers.
  useEffect(() => {
    if (!shouldSearch) {
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
  }, [shouldSearch, term, search]);

  const suggestions = shouldSearch
    ? results.filter(
        (option) => !selected.some((item) => item.value === option.value),
      )
    : [];
  const best = suggestions[0];
  const searched = searchedFor === term && error === null;

  function add(option: LookupOption | undefined) {
    if (!option || isFull) {
      return;
    }
    onChange([...selected, option]);
    setText('');
  }

  return (
    // Enter here adds a value, so it must not also reach StepShell's "OK".
    // Only Enter in the empty input is left for "OK".
    <div
      className="flex flex-col gap-4"
      onKeyDown={(event) => {
        const emptyInput =
          event.target instanceof HTMLInputElement && term === '';
        if (event.key === 'Enter' && !emptyInput) {
          event.stopPropagation();
        }
      }}
    >
      {selected.length > 0 && (
        <div className="space-y-2">
          <p className={cn(overline, 'text-ink-muted')}>
            Selected · {selected.length}/{max}
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map((option, index) => (
              <FilterChip
                key={option.value}
                variant="selected"
                label={
                  numbered
                    ? `${String(index + 1)}. ${option.label}`
                    : option.label
                }
                ariaLabel={`Remove ${option.label}`}
                onClick={() => {
                  onChange(
                    selected.filter((item) => item.value !== option.value),
                  );
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor={inputId} className={fieldLabel}>
          {label}
        </label>
        <div className="flex gap-2">
          <Input
            id={inputId}
            autoFocus={autoFocus}
            disabled={isFull}
            value={text}
            placeholder={isFull ? 'Limit reached' : placeholder}
            onChange={(event) => {
              setText(event.target.value);
            }}
            onKeyDown={(event) => {
              // Enter adds the best match instead of going to the next step.
              if (event.key === 'Enter' && term !== '') {
                event.preventDefault();
                add(best);
              }
            }}
            className={cn(field, 'h-12 text-base md:text-base')}
          />
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-pill px-4"
            disabled={isFull || term === '' || !best}
            onClick={() => {
              add(best);
            }}
          >
            <Plus data-icon="inline-start" />
            Add
          </Button>
        </div>
        {isFull && (
          <p className="text-sm text-ink-muted">
            Up to {max}. Remove one to add another.
          </p>
        )}
      </div>

      {!isFull && suggestions.length > 0 && (
        <div className="space-y-2">
          <p className={cn(overline, 'text-ink-muted')}>
            {term === '' ? 'Suggestions' : 'Results'}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((option) => (
              <FilterChip
                key={option.value}
                variant="add"
                label={option.label}
                onClick={() => {
                  add(option);
                }}
              />
            ))}
          </div>
        </div>
      )}
      <p aria-live="polite" className="sr-only">
        {searched && term !== '' ? `${String(suggestions.length)} results` : ''}
      </p>
      {!isFull && searched && term !== '' && suggestions.length === 0 && (
        <p aria-hidden="true" className="text-sm text-ink-muted">
          No matches.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
