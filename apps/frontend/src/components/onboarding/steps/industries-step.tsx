'use client';

import { type Industry, MAX_PROFILE_INDUSTRIES } from '@job-scraper/shared';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { ChipList } from './common/chip-list';
import { searchIndustries } from './common/search-industries';
import { StepShell } from './common/step-shell';

const SEARCH_DELAY_MS = 250;

interface IndustriesStepProps {
  selected: Industry[];
  onChange: (industries: Industry[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function IndustriesStep({
  selected,
  onChange,
  onNext,
  onBack,
}: IndustriesStepProps) {
  const [text, setText] = useState('');
  const [results, setResults] = useState<Industry[]>([]);
  const isFull = selected.length >= MAX_PROFILE_INDUSTRIES;

  // Debounce: search once the user pauses typing; ignore outdated answers.
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      void searchIndustries(text).then((found) => {
        if (!cancelled) {
          setResults(found);
        }
      });
    }, SEARCH_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text]);

  const options = results.filter(
    (industry) => !selected.some((item) => item.slug === industry.slug),
  );

  function add(industry: Industry) {
    if (isFull) {
      return;
    }
    onChange([...selected, industry]);
    setText('');
  }

  return (
    <StepShell
      tag="Industries"
      number={10}
      title="Which industries interest you?"
      subtitle={`Pick up to ${String(MAX_PROFILE_INDUSTRIES)}. The first one is the most important.`}
      onNext={onNext}
      onSkip={onNext}
      onBack={onBack}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="industry-search" className="text-ink">
            Search industries
          </Label>
          <Input
            id="industry-search"
            autoFocus
            disabled={isFull}
            placeholder={isFull ? 'Limit reached' : 'e.g. Finance'}
            className="h-12 rounded-card px-4 text-base"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
            }}
            onKeyDown={(event) => {
              // Enter picks the first match instead of going to the next step.
              const first = options[0];
              if (event.key === 'Enter' && text.trim() !== '' && first) {
                event.preventDefault();
                event.stopPropagation();
                add(first);
              }
            }}
          />
        </div>

        <ChipList
          caption="Selected"
          max={MAX_PROFILE_INDUSTRIES}
          items={selected.map((industry, index) => ({
            id: industry.slug,
            label: `${String(index + 1)}. ${industry.name}`,
          }))}
          onRemove={(slug) => {
            onChange(selected.filter((industry) => industry.slug !== slug));
          }}
        />

        {!isFull && (
          <div className="space-y-3">
            <p className="text-xs font-medium tracking-widest text-ink-muted uppercase">
              {text.trim() === '' ? 'Suggestions' : 'Results'}
            </p>
            {options.length === 0 ? (
              <p className="text-sm text-ink-muted">No industries found.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {options.map((industry) => (
                  <li key={industry.slug}>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-ink"
                      onClick={() => {
                        add(industry);
                      }}
                    >
                      <Plus className="size-3.5" />
                      {industry.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </StepShell>
  );
}
