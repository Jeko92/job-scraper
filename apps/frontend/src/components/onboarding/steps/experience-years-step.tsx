'use client';

import { Minus, Plus } from 'lucide-react';
import type { Dispatch } from 'react';

import { Button } from '@/components/ui/button';

import type { OnboardingAction } from '../onboarding-state';
import { StepShell } from './common/step-shell';

const MIN_YEARS = 0;
//max-years on backend 99.9 but it doesn't make sense.
const MAX_YEARS = 30;
const STEP = 0.5;

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
  const years = value ?? MIN_YEARS;

  function change(delta: number) {
    dispatch({
      type: 'answer',
      patch: { yearsExperience: years + delta },
    });
  }

  function next() {
    dispatch({ type: 'next' });
  }

  return (
    <StepShell
      tag="Experience"
      number={number}
      title="How many years of experience do you have?"
      subtitle="Use − and + to set it. Half years are fine."
      onNext={next}
      onSkip={next}
      onBack={() => {
        dispatch({ type: 'back' });
      }}
    >
      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          size="icon-lg"
          className="size-12 rounded-pill"
          aria-label="Fewer years"
          disabled={years - STEP < MIN_YEARS}
          onClick={() => {
            change(-STEP);
          }}
        >
          <Minus />
        </Button>
        <p
          aria-live="polite"
          className="min-w-24 text-center font-heading text-5xl text-ink"
        >
          {years}
          <span className="sr-only"> years</span>
        </p>
        <Button
          variant="outline"
          size="icon-lg"
          className="size-12 rounded-pill"
          aria-label="More years"
          disabled={years + STEP > MAX_YEARS}
          onClick={() => {
            change(STEP);
          }}
        >
          <Plus />
        </Button>
      </div>
    </StepShell>
  );
}
