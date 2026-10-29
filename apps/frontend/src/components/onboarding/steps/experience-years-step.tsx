'use client';

import { MAX_YEARS_EXPERIENCE } from '@job-scraper/shared';
import { Minus, Plus } from 'lucide-react';
import { type Dispatch, useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { OnboardingAction } from '../onboarding-state';
import { StepShell } from './common/step-shell';

const MIN_YEARS = 0;
const STEP = 0.5;

/** Rounds to the nearest half year inside MIN_YEARS…MAX_YEARS_EXPERIENCE. */
function toYears(value: number): number {
  const rounded = Math.round(value / STEP) * STEP;
  return Math.min(Math.max(rounded, MIN_YEARS), MAX_YEARS_EXPERIENCE);
}

/** The typed years, or null when the text is not a number in range. */
function parseYears(text: string): number | null {
  // Accepts a comma too ("2,5").
  const typed = Number(text.trim().replace(',', '.'));
  return Number.isFinite(typed) &&
    typed >= MIN_YEARS &&
    typed <= MAX_YEARS_EXPERIENCE
    ? typed
    : null;
}

interface ExperienceYearsStepProps {
  number: number;
  value: number | null | undefined;
  dispatch: Dispatch<OnboardingAction>;
}

export function ExperienceYearsStep({
  number,
  value,
  dispatch,
}: ExperienceYearsStepProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const errorId = useId();
  const years = value ?? null;
  const invalid =
    draft !== null && draft.trim() !== '' && parseYears(draft) === null;

  function save(yearsExperience: number | null) {
    dispatch({ type: 'answer', patch: { yearsExperience } });
  }

  function change(delta: number) {
    setDraft(null);
    save(toYears((years ?? MIN_YEARS) + delta));
  }

  function next() {
    dispatch({ type: 'next' });
  }

  return (
    <StepShell
      tag="Experience"
      number={number}
      title="How many years of experience do you have?"
      subtitle="Type it or use − and +. Half years are fine."
      nextDisabled={invalid}
      onNext={next}
      onSkip={next}
      onBack={() => {
        dispatch({ type: 'back' });
      }}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-6">
          <Button
            variant="outline"
            size="icon-lg"
            className="size-12 rounded-pill"
            aria-label="Fewer years"
            disabled={years === null || years - STEP < MIN_YEARS}
            onClick={() => {
              change(-STEP);
            }}
          >
            <Minus />
          </Button>
          <Input
            aria-label="Years of experience"
            inputMode="decimal"
            autoComplete="off"
            placeholder="–"
            aria-invalid={invalid}
            aria-describedby={invalid ? errorId : undefined}
            value={draft ?? (years === null ? '' : String(years))}
            onChange={(event) => {
              const text = event.target.value;
              setDraft(text);
              // Empty means "Not set", like on the review page.
              if (text.trim() === '') {
                save(null);
                return;
              }
              const typed = parseYears(text);
              if (typed !== null) {
                save(toYears(typed));
              }
            }}
            onBlur={() => {
              // A wrong value stays visible, so it can be fixed.
              if (!invalid) {
                setDraft(null);
              }
            }}
            className="h-16 w-36 rounded-card text-center font-heading text-5xl text-ink md:text-5xl"
          />
          <Button
            variant="outline"
            size="icon-lg"
            className="size-12 rounded-pill"
            aria-label="More years"
            disabled={years !== null && years + STEP > MAX_YEARS_EXPERIENCE}
            onClick={() => {
              change(STEP);
            }}
          >
            <Plus />
          </Button>
        </div>
        {invalid && (
          <p id={errorId} role="alert" className="text-sm text-destructive">
            Enter a number from {MIN_YEARS} to {MAX_YEARS_EXPERIENCE}.
          </p>
        )}
      </div>
    </StepShell>
  );
}
