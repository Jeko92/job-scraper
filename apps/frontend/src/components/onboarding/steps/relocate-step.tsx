'use client';

import { MAX_PREFERENCES_LOCATIONS } from '@job-scraper/shared';
import type { Dispatch } from 'react';

import type { OnboardingAction } from '../onboarding-state';
import { type Option, OptionList } from './common/option-list';
import { PreferenceLocationsField } from './common/preference-locations-field';
import { StepShell } from './common/step-shell';

type Answer = 'YES' | 'NO';

const OPTIONS: Option<Answer>[] = [
  { value: 'YES', label: 'Yes' },
  { value: 'NO', label: 'No' },
];

interface RelocateStepProps {
  number: number;
  value: boolean | undefined;
  locationIds: string[] | undefined;
  dispatch: Dispatch<OnboardingAction>;
}

export function RelocateStep({
  number,
  value,
  locationIds = [],
  dispatch,
}: RelocateStepProps) {
  // OptionList works with strings, the profile stores a boolean.
  const selected: Answer | undefined =
    value === undefined ? undefined : value ? 'YES' : 'NO';

  function answer(willingToRelocate: boolean) {
    dispatch({ type: 'answer', patch: { preferences: { willingToRelocate } } });
  }

  return (
    <StepShell
      tag="Relocation"
      number={number}
      title="Are you open to relocating?"
      subtitle={`If yes, pick up to ${String(MAX_PREFERENCES_LOCATIONS)} places you would move to.`}
      nextDisabled={selected === undefined}
      onNext={() => {
        dispatch({ type: 'next' });
      }}
      onSkip={() => {
        // Skipping counts as "No" (wireframe).
        answer(false);
        dispatch({ type: 'next' });
      }}
      onBack={() => {
        dispatch({ type: 'back' });
      }}
    >
      <div className="space-y-8">
        <OptionList
          label="Open to relocating"
          options={OPTIONS}
          value={selected}
          onSelect={(choice) => {
            answer(choice === 'YES');
          }}
        />
        {value === true && (
          <PreferenceLocationsField
            locationIds={locationIds}
            onChange={(ids) => {
              dispatch({
                type: 'answer',
                patch: { preferencesLocationIds: ids },
              });
            }}
          />
        )}
      </div>
    </StepShell>
  );
}
