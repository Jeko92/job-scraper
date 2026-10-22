'use client';

import { MAX_PREFERENCES_LOCATIONS } from '@job-scraper/shared';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { ChipList } from './chip-list';

interface PreferenceLocationsFieldProps {
  locationIds: string[];
  onChange: (locationIds: string[]) => void;
}

// Places the user would move to; shown on the relocation card after "Yes".
export function PreferenceLocationsField({
  locationIds,
  onChange,
}: PreferenceLocationsFieldProps) {
  const [draft, setDraft] = useState('');
  const isFull = locationIds.length >= MAX_PREFERENCES_LOCATIONS;

  function add() {
    const id = draft.trim();
    if (id === '' || isFull || locationIds.includes(id)) {
      return;
    }
    onChange([...locationIds, id]);
    setDraft('');
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="preference-location" className="text-ink">
          Which locations would you consider?
        </Label>
        {/* TODO: replace with the LookupFilter from PR #84 */}
        <div className="flex gap-2">
          <Input
            id="preference-location"
            autoFocus
            disabled={isFull}
            placeholder={
              isFull ? 'Limit reached' : 'Location id (temporary, paste a UUID)'
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
          onChange(locationIds.filter((locationId) => locationId !== id));
        }}
      />
    </div>
  );
}
