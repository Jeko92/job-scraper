'use client';

import { MAX_PREFERENCES_LOCATIONS } from '@job-scraper/shared';
import type { Dispatch } from 'react';

import { LookupField } from '@/components/lookups/lookup-field';
import { searchLocationOptions } from '@/lib/lookups/search';
import type { LookupOption } from '@/lib/lookups/types';

import type { OnboardingAction } from '../onboarding-state';
import { type Option, OptionList } from './common/option-list';
import { StepShell } from './common/step-shell';

type Answer = 'YES' | 'NO';

const OPTIONS: Option<Answer>[] = [
  { value: 'YES', label: 'Yes' },
  { value: 'NO', label: 'No' },
];

interface RelocateStepProps {
  number: number;
  value: boolean | undefined;
  places: LookupOption[];
  onPlacesChange: (places: LookupOption[]) => void;
  dispatch: Dispatch<OnboardingAction>;
}

export function RelocateStep({
  number,
  value,
  places,
  onPlacesChange,
  dispatch,
}: RelocateStepProps) {
  // OptionList works with strings, the profile stores a boolean.
  const selected: Answer | undefined =
    value === undefined ? undefined : value ? 'YES' : 'NO';

  function answer(willingToRelocate: boolean) {
    dispatch({ type: 'answer', patch: { preferences: { willingToRelocate } } });
    // "No" drops the places chosen before, so their chips go too.
    if (!willingToRelocate) {
      onPlacesChange([]);
    }
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
        // Skipping keeps whatever was answered before.
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
          <LookupField
            label="Which places would you move to?"
            placeholder="e.g. Munich"
            selected={places}
            max={MAX_PREFERENCES_LOCATIONS}
            search={searchLocationOptions}
            onChange={onPlacesChange}
          />
        )}
      </div>
    </StepShell>
  );
}
