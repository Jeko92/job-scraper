'use client';

import {
  EMPLOYMENT_TYPES,
  MAX_PREFERENCES_LOCATIONS,
  REMOTE_PREFERENCES,
  type UserProfile,
} from '@job-scraper/shared';

import { LookupField } from '@/components/lookups/lookup-field';
import { toLocationOption } from '@/lib/lookups/options';
import { searchLocationOptions } from '@/lib/lookups/search';
import type { LookupOption } from '@/lib/lookups/types';
import {
  EMPLOYMENT_LABELS,
  WORK_SETUP_LABELS,
} from '@/lib/profile/enum-labels';

import { EditableRow, type RowControl } from '../common/editable-row';
import { ProfileGroup } from '../common/profile-group';
import { enumItems, RowSelect, type RowSelectItem } from '../common/row-select';

const EMPLOYMENT_ITEMS = enumItems(EMPLOYMENT_TYPES, EMPLOYMENT_LABELS);
const WORK_SETUP_ITEMS = enumItems(REMOTE_PREFERENCES, WORK_SETUP_LABELS);
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
    <ProfileGroup title="Job preferences">
      <EditableRow
        {...row('employmentType')}
        label="Employment"
        value={
          preferences?.employmentType &&
          EMPLOYMENT_LABELS[preferences.employmentType]
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
          WORK_SETUP_LABELS[preferences.remotePreference]
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
        label="Relocate"
        value={relocate === null ? null : relocate ? 'Yes' : 'No'}
        initialDraft={relocate}
        renderEditor={(draft, setDraft) => (
          <RowSelect
            label="Open to relocating"
            items={RELOCATE_ITEMS}
            value={draft}
            onChange={setDraft}
          />
        )}
        buildRequest={(draft) =>
          draft === null
            ? ['Choose Yes or No.']
            : {
                preferences: { willingToRelocate: draft },
                ...(draft ? {} : { preferencesLocationIds: [] }),
              }
        }
      />

      {relocate === true && (
        <EditableRow<LookupOption[]>
          {...row('preferencesLocations')}
          label="Places"
          value={places.map((place) => place.label).join(' · ')}
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
    </ProfileGroup>
  );
}
