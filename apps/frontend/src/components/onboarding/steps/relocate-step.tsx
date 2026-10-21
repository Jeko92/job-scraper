'use client';

import type { Dispatch } from 'react';

import type { OnboardingAction } from '../onboarding-state';
import { type Option, OptionList } from './common/option-list';
import { StepShell } from './common/step-shell';

type Answer = 'YES' | 'NO';

const OPTIONS: Option<Answer>[] = [
  { value: 'YES', label: 'Yes' },
  { value: 'NO', label: 'No' },
];

interface RelocateStepProps {
  value: boolean | undefined;
  dispatch: Dispatch<OnboardingAction>;
}

export function RelocateStep({ value, dispatch }: RelocateStepProps) {
  // OptionList works with strings, the profile stores a boolean.
  const selected: Answer | undefined =
    value === undefined ? undefined : value ? 'YES' : 'NO';

  function answer(willingToRelocate: boolean) {
    dispatch({ type: 'answer', patch: { preferences: { willingToRelocate } } });
  }

  return (
    <StepShell
      tag="Relocation"
      number={6}
      title="Are you open to relocating?"
      subtitle="If yes, you can pick up to 4 places next."
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
      <OptionList
        label="Open to relocating"
        options={OPTIONS}
        value={selected}
        onSelect={(choice) => {
          answer(choice === 'YES');
        }}
      />
    </StepShell>
  );
}
