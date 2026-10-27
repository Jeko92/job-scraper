'use client';

import {
  EMPLOYMENT_TYPES,
  MAX_PREFERENCES_LOCATIONS,
  REMOTE_PREFERENCES,
  type UserProfile,
} from '@job-scraper/shared';

import { LookupField } from '@/components/lookups/lookup-field';
import {
  EMPLOYMENT_TYPE_LABELS,
  REMOTE_PREFERENCE_LABELS,
} from '@/lib/common/enum-labels';
import { toLocationOption } from '@/lib/lookups/options';
import { searchLocationOptions } from '@/lib/lookups/search';
import type { LookupOption } from '@/lib/lookups/types';

import { ChipList } from '../common/chip-list';
import { EditableRow, type RowControl } from '../common/editable-row';
import { enumItems, RowSelect, type RowSelectItem } from '../common/row-select';

const EMPLOYMENT_ITEMS = enumItems(EMPLOYMENT_TYPES, EMPLOYMENT_TYPE_LABELS);
const WORK_SETUP_ITEMS = enumItems(
  REMOTE_PREFERENCES,
  REMOTE_PREFERENCE_LABELS,
);
const RELOCATE_ITEMS: RowSelectItem<boolean | null>[] = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' },
];

interface PreferencesSectionProps {
  profile: UserProfile;
  /** Open state and callbacks for one row, by its id. */
  row: (id: string) => RowControl;
}

export function PreferencesSection({ profile, row }: PreferencesSectionProps) {
  // null until the user answered any preference question.
  const { preferences } = profile;
  const relocate = preferences?.willingToRelocate ?? null;
  const places = profile.preferencesLocations.map(toLocationOption);

  return (
    <>
      <EditableRow
        {...row('employmentType')}
        label="Employment type"
        value={
          preferences?.employmentType &&
          EMPLOYMENT_TYPE_LABELS[preferences.employmentType]
        }
        initialDraft={preferences?.employmentType ?? null}
        renderEditor={(draft, setDraft) => (
          <RowSelect
            label="Employment type"
            items={EMPLOYMENT_ITEMS}
            value={draft}
            onChange={setDraft}
          />
        )}
        buildRequest={(draft) => ({ preferences: { employmentType: draft } })}
      />

      <EditableRow
        {...row('remotePreference')}
        label="Work setup"
        value={
          preferences?.remotePreference &&
          REMOTE_PREFERENCE_LABELS[preferences.remotePreference]
        }
        initialDraft={preferences?.remotePreference ?? null}
        renderEditor={(draft, setDraft) => (
          <RowSelect
            label="Work setup"
            items={WORK_SETUP_ITEMS}
            value={draft}
            onChange={setDraft}
          />
        )}
        buildRequest={(draft) => ({
          preferences: { remotePreference: draft },
        })}
      />

      <EditableRow
        {...row('willingToRelocate')}
        label="Open to relocating"
        value={relocate === null ? null : relocate ? 'Yes' : 'No'}
        initialDraft={relocate}
        renderEditor={(draft, setDraft) => (
          <RowSelect
            label="Open to relocating"
            items={RELOCATE_ITEMS}
            value={draft}
            onChange={setDraft}
            placeholder="Choose Yes or No"
          />
        )}
        buildRequest={(draft) => ({
          preferences: { willingToRelocate: draft === true },
          ...(draft ? {} : { preferencesLocationIds: [] }),
        })}
      />

      {relocate === true && (
        <EditableRow<LookupOption[]>
          {...row('preferencesLocations')}
          label="Preferred locations"
          addLabel="Add city"
          value={
            places.length > 0 ? (
              <ChipList labels={places.map((place) => place.label)} />
            ) : null
          }
          initialDraft={places}
          renderEditor={(draft, setDraft) => (
            <LookupField
              label="Search cities or regions"
              placeholder="e.g. Hamburg"
              selected={draft}
              max={MAX_PREFERENCES_LOCATIONS}
              search={searchLocationOptions}
              onChange={setDraft}
            />
          )}
          buildRequest={(draft) => ({
            preferencesLocationIds: draft.map((place) => place.value),
          })}
        />
      )}
    </>
  );
}
