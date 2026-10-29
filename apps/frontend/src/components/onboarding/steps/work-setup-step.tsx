'use client';

import { REMOTE_PREFERENCES, type RemotePreference } from '@job-scraper/shared';
import type { Dispatch } from 'react';

import { REMOTE_PREFERENCE_LABELS } from '@/lib/common/enum-labels';

import type { OnboardingAction } from '../onboarding-state';
import { type Option, OptionList } from './common/option-list';
import { StepShell } from './common/step-shell';

const OPTIONS: Option<RemotePreference>[] = REMOTE_PREFERENCES.map((setup) => ({
  value: setup,
  label: REMOTE_PREFERENCE_LABELS[setup],
}));

interface WorkSetupStepProps {
  number: number;
  value: RemotePreference | null | undefined;
  dispatch: Dispatch<OnboardingAction>;
}

export function WorkSetupStep({ number, value, dispatch }: WorkSetupStepProps) {
  function next() {
    dispatch({ type: 'next' });
  }

  return (
    <StepShell
      tag="Work setup"
      number={number}
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
