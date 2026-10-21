'use client';

import type { Dispatch } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { OnboardingAction } from '../onboarding-state';
import { StepShell } from './common/step-shell';

const FIELD_CLASS = 'h-12 rounded-card px-4 text-base';

interface EssentialsStepProps {
  headline: string | null | undefined;
  locationId: string | null | undefined;
  dispatch: Dispatch<OnboardingAction>;
}

export function EssentialsStep({
  headline,
  locationId,
  dispatch,
}: EssentialsStepProps) {
  const canContinue = Boolean(headline?.trim()) && Boolean(locationId);

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
          Skip the rest →
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="headline" className="text-ink">
            <span className="text-highlight">1 →</span>
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

        <div className="space-y-2">
          <Label htmlFor="locationId" className="text-ink">
            <span className="text-highlight">2 →</span>
            Where are you based?
          </Label>
          {/* TODO: replace with the LocationAutocomplete from the lookups task */}
          <Input
            id="locationId"
            placeholder="Location id (temporary, paste a UUID)"
            className={FIELD_CLASS}
            value={locationId ?? ''}
            onChange={(event) => {
              dispatch({
                type: 'answer',
                patch: { locationId: event.target.value.trim() || null },
              });
            }}
          />
        </div>
      </div>
    </StepShell>
  );
}
