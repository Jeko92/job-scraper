'use client';

import { SENIORITY_LEVELS, type SeniorityLevel } from '@job-scraper/shared';
import type { Dispatch } from 'react';

import { SENIORITY_LABELS } from '@/lib/profile/enum-labels';

import type { OnboardingAction } from '../onboarding-state';
import { type Option, OptionList } from './common/option-list';
import { StepShell } from './common/step-shell';

const OPTIONS: Option<SeniorityLevel>[] = SENIORITY_LEVELS.map((level) => ({
  value: level,
  label: SENIORITY_LABELS[level],
}));

interface SeniorityStepProps {
  number: number;
  value: SeniorityLevel | null | undefined;
  dispatch: Dispatch<OnboardingAction>;
}

export function SeniorityStep({ number, value, dispatch }: SeniorityStepProps) {
  function next() {
    dispatch({ type: 'next' });
  }

  return (
    <StepShell
      tag="Seniority"
      number={number}
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
