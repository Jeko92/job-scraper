'use client';

import type { Dispatch } from 'react';

import { LookupField } from '@/components/lookups/lookup-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { searchLocationOptions } from '@/lib/lookups/search';
import type { LookupOption } from '@/lib/lookups/types';

import type { OnboardingAction } from '../onboarding-state';
import { StepShell } from './common/step-shell';

const FIELD_CLASS = 'h-12 rounded-card px-4 text-base';

interface EssentialsStepProps {
  headline: string | null | undefined;
  location: LookupOption | null;
  onLocationChange: (location: LookupOption | null) => void;
  dispatch: Dispatch<OnboardingAction>;
}

export function EssentialsStep({
  headline,
  location,
  onLocationChange,
  dispatch,
}: EssentialsStepProps) {
  const canContinue = Boolean(headline?.trim()) && location !== null;

  return (
    <StepShell
      tag="Essentials"
      title="Let's start with the essentials"
      subtitle="Only these two questions are required."
      nextLabel="Continue"
      nextDisabled={!canContinue}
      onNext={() => {
        dispatch({ type: 'next' });
      }}
      onBack={() => {
        dispatch({ type: 'back' });
      }}
      secondaryAction={
        <Button
          variant="link"
          className="text-ink-muted"
          onClick={() => {
            dispatch({ type: 'goTo', step: 'review' });
          }}
        >
          Skip the rest <span aria-hidden="true">→</span>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="headline" className="text-ink">
            <span aria-hidden="true" className="text-highlight">
              1 →
            </span>
            What role are you looking for?
          </Label>
          <Input
            id="headline"
            autoFocus
            maxLength={200}
            placeholder="e.g. Fullstack developer"
            className={FIELD_CLASS}
            value={headline ?? ''}
            onChange={(event) => {
              dispatch({
                type: 'answer',
                patch: { headline: event.target.value },
              });
            }}
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="flex items-center gap-2 text-sm leading-none font-medium text-ink">
            <span aria-hidden="true" className="text-highlight">
              2 →
            </span>
            Where are you based?
          </legend>
          <LookupField
            label="Search your city or region"
            placeholder="e.g. Berlin"
            selected={location ? [location] : []}
            max={1}
            search={searchLocationOptions}
            autoFocus={false}
            onChange={(next) => {
              onLocationChange(next[0] ?? null);
            }}
          />
        </fieldset>
      </div>
    </StepShell>
  );
}
