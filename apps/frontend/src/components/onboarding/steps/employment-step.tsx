'use client';

import { EMPLOYMENT_TYPES, type EmploymentType } from '@job-scraper/shared';
import type { Dispatch } from 'react';

import { EMPLOYMENT_TYPE_LABELS } from '@/lib/common/enum-labels';

import type { OnboardingAction } from '../onboarding-state';
import { type Option, OptionList } from './common/option-list';
import { StepShell } from './common/step-shell';

const OPTIONS: Option<EmploymentType>[] = EMPLOYMENT_TYPES.map((type) => ({
  value: type,
  label: EMPLOYMENT_TYPE_LABELS[type],
}));

interface EmploymentStepProps {
  number: number;
  value: EmploymentType | null | undefined;
  dispatch: Dispatch<OnboardingAction>;
}

export function EmploymentStep({
  number,
  value,
  dispatch,
}: EmploymentStepProps) {
  function next() {
    dispatch({ type: 'next' });
  }

  return (
    <StepShell
      tag="Employment"
      number={number}
      title="What type of employment are you looking for?"
      subtitle="Pick one. You can change it later."
      nextDisabled={!value}
      onNext={next}
      onSkip={next}
      onBack={() => {
        dispatch({ type: 'back' });
      }}
    >
      <OptionList
        label="Employment type"
        options={OPTIONS}
        value={value}
        onSelect={(type) => {
          dispatch({
            type: 'answer',
            patch: { preferences: { employmentType: type } },
          });
        }}
      />
    </StepShell>
  );
}
