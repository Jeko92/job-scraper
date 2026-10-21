'use client';

import type { RemotePreference } from '@job-scraper/shared';
import type { Dispatch } from 'react';

import type { OnboardingAction } from '../onboarding-state';
import { type Option, OptionList } from './common/option-list';
import { StepShell } from './common/step-shell';

const OPTIONS: Option<RemotePreference>[] = [
  { value: 'ONSITE', label: 'On-site' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'REMOTE', label: 'Remote' },
];

interface WorkSetupStepProps {
  value: RemotePreference | null | undefined;
  dispatch: Dispatch<OnboardingAction>;
}

export function WorkSetupStep({ value, dispatch }: WorkSetupStepProps) {
  function next() {
    dispatch({ type: 'next' });
  }

  return (
    <StepShell
      tag="Work setup"
      number={5}
      title="How do you want to work?"
      subtitle="Pick one. You can change it later."
      nextDisabled={!value}
      onNext={next}
      onSkip={next}
      onBack={() => {
        dispatch({ type: 'back' });
      }}
    >
      <OptionList
        label="Work setup"
        options={OPTIONS}
        value={value}
        onSelect={(setup) => {
          dispatch({
            type: 'answer',
            patch: { preferences: { remotePreference: setup } },
          });
        }}
      />
    </StepShell>
  );
}
