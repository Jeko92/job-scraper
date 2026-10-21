'use client';

import { MAX_PREFERENCES_LOCATIONS } from '@job-scraper/shared';
import { Plus } from 'lucide-react';
import { type Dispatch, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { OnboardingAction } from '../onboarding-state';
import { ChipList } from './common/chip-list';
import { StepShell } from './common/step-shell';

interface PreferenceLocationsStepProps {
  locationIds: string[] | undefined;
  dispatch: Dispatch<OnboardingAction>;
}

export function PreferenceLocationsStep({
  locationIds = [],
  dispatch,
}: PreferenceLocationsStepProps) {
  const [draft, setDraft] = useState('');
  const isFull = locationIds.length >= MAX_PREFERENCES_LOCATIONS;

  function save(ids: string[]) {
    dispatch({ type: 'answer', patch: { preferencesLocationIds: ids } });
  }

  function add() {
    const id = draft.trim();
    if (id === '' || isFull || locationIds.includes(id)) {
      return;
    }
    save([...locationIds, id]);
    setDraft('');
  }

  function next() {
    dispatch({ type: 'next' });
  }

  return (
    <StepShell
      tag="Locations"
      number={7}
      title="Which locations would you consider?"
      subtitle={`Pick up to ${String(MAX_PREFERENCES_LOCATIONS)} places you would move to.`}
      onNext={next}
      onSkip={next}
      onBack={() => {
        dispatch({ type: 'back' });
      }}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="preference-location" className="text-ink">
            Add a city or region
          </Label>
          {/* TODO: replace with the LocationAutocomplete from the lookups task */}
          <div className="flex gap-2">
            <Input
              id="preference-location"
              autoFocus
              disabled={isFull}
              placeholder={
                isFull
                  ? 'Limit reached'
                  : 'Location id (temporary, paste a UUID)'
              }
              className="h-12 rounded-card px-4 text-base"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
              }}
              onKeyDown={(event) => {
                // Enter adds the location instead of going to the next step.
                if (event.key === 'Enter' && draft.trim() !== '') {
                  event.preventDefault();
                  event.stopPropagation();
                  add();
                }
              }}
            />
            <Button
              variant="outline"
              className="h-12 rounded-pill px-4"
              disabled={isFull || draft.trim() === ''}
              onClick={add}
            >
              <Plus data-icon="inline-start" />
              Add
            </Button>
          </div>
        </div>

        <ChipList
          caption="Selected"
          max={MAX_PREFERENCES_LOCATIONS}
          items={locationIds.map((id) => ({ id, label: id }))}
          onRemove={(id) => {
            save(locationIds.filter((locationId) => locationId !== id));
          }}
        />
      </div>
    </StepShell>
  );
}
