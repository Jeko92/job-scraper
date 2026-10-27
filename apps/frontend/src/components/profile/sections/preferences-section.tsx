'use client';

import {
  EMPLOYMENT_TYPES,
  MAX_PREFERENCES_LOCATIONS,
  REMOTE_PREFERENCES,
} from '@job-scraper/shared';

import {
  EMPLOYMENT_TYPE_LABELS,
  REMOTE_PREFERENCE_LABELS,
} from '@/lib/common/enum-labels';
import { toLocationOption } from '@/lib/lookups/options';
import { searchLocationOptions } from '@/lib/lookups/search';

import { EditableRow, type SectionProps } from '../common/editable-row';
import { LookupRow } from '../common/lookup-row';
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

export function PreferencesSection({ profile, row }: SectionProps) {
  // null until the user answered any preference question.
  const { preferences } = profile;
  const relocate = preferences?.willingToRelocate ?? null;

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
        <LookupRow
          {...row('preferencesLocations')}
          label="Preferred locations"
          addLabel="Add city"
          searchLabel="Search cities or regions"
          placeholder="e.g. Hamburg"
          options={profile.preferencesLocations.map(toLocationOption)}
          max={MAX_PREFERENCES_LOCATIONS}
          search={searchLocationOptions}
          buildRequest={(ids) => ({ preferencesLocationIds: ids })}
        />
      )}
    </>
  );
}
