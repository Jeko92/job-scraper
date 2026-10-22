'use client';

import { SENIORITY_LEVELS, type SeniorityLevel } from '@job-scraper/shared';
import type { Dispatch } from 'react';

import type { OnboardingAction } from '../onboarding-state';
import { type Option, OptionList } from './common/option-list';
import { StepShell } from './common/step-shell';

export const SENIORITY_LABELS: Record<SeniorityLevel, string> = {
  INTERN: 'Intern',
  JUNIOR: 'Junior',
  MID: 'Mid',
  SENIOR: 'Senior',
  LEAD: 'Lead',
};

const OPTIONS: Option<SeniorityLevel>[] = SENIORITY_LEVELS.map((level) => ({
  value: level,
  label: SENIORITY_LABELS[level],
}));

interface SeniorityStepProps {
  value: SeniorityLevel | null | undefined;
  dispatch: Dispatch<OnboardingAction>;
}

export function SeniorityStep({ value, dispatch }: SeniorityStepProps) {
  function next() {
    dispatch({ type: 'next' });
  }

  return (
    <StepShell
      tag="Seniority"
      number={3}
      title="What's your seniority?"
      subtitle="Pick one. You can change it later."
      nextDisabled={!value}
      onNext={next}
      onSkip={next}
      onBack={() => {
        dispatch({ type: 'back' });
      }}
    >
      <OptionList
        label="Seniority"
        options={OPTIONS}
        value={value}
        onSelect={(level) => {
          dispatch({ type: 'answer', patch: { seniority: level } });
        }}
      />
    </StepShell>
  );
}
