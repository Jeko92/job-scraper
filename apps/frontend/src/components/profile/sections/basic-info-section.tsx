'use client';

import { SENIORITY_LEVELS, type UserProfile } from '@job-scraper/shared';

import { LookupField } from '@/components/lookups/lookup-field';
import { Input } from '@/components/ui/input';
import { toLocationOption } from '@/lib/lookups/options';
import { searchLocationOptions } from '@/lib/lookups/search';
import type { LookupOption } from '@/lib/lookups/types';
import { SENIORITY_LABELS } from '@/lib/profile/enum-labels';

import { EditableRow, type RowControl } from '../common/editable-row';
import { enumItems, RowSelect } from '../common/row-select';
import { ProfileSectionCard } from '../common/section-card';

const FIELD_CLASS = 'h-10 rounded-card px-3 text-base';
// The backend allows up to 99.9;
const MAX_YEARS = 30;

const SENIORITY_ITEMS = enumItems(SENIORITY_LEVELS, SENIORITY_LABELS);

interface BasicInfoSectionProps {
  profile: UserProfile;
  /** Open state and callbacks for one row, by its id. */
  row: (id: string) => RowControl;
}

export function BasicInfoSection({ profile, row }: BasicInfoSectionProps) {
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
  const years = profile.yearsExperience;
  const location = profile.location ? toLocationOption(profile.location) : null;

  return (
    <ProfileSectionCard title="Basic info">
      <dl className="divide-y divide-line">
        <EditableRow
          {...row('name')}
          label="Name"
          value={name}
          initialDraft={{
            firstName: profile.firstName ?? '',
            lastName: profile.lastName ?? '',
          }}
          renderEditor={(draft, setDraft) => (
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                autoFocus
                aria-label="First name"
                placeholder="First name"
                maxLength={100}
                className={FIELD_CLASS}
                value={draft.firstName}
                onChange={(event) => {
                  setDraft({ ...draft, firstName: event.target.value });
                }}
              />
              <Input
                aria-label="Last name"
                placeholder="Last name"
                maxLength={100}
                className={FIELD_CLASS}
                value={draft.lastName}
                onChange={(event) => {
                  setDraft({ ...draft, lastName: event.target.value });
                }}
              />
            </div>
          )}
          //TODO: Refactot -> Names cannot be cleared on the backend, so an empty one is not sent.
          buildRequest={(draft) => ({
            firstName: draft.firstName.trim() || undefined,
            lastName: draft.lastName.trim() || undefined,
          })}
        />

        <EditableRow
          {...row('headline')}
          label="Role"
          value={profile.headline}
          initialDraft={profile.headline ?? ''}
          renderEditor={(draft, setDraft) => (
            <Input
              autoFocus
              aria-label="Role"
              placeholder="e.g. Fullstack developer"
              maxLength={200}
              className={FIELD_CLASS}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
              }}
            />
          )}
          buildRequest={(draft) =>
            draft.trim() === ''
              ? ['Role is required.']
              : { headline: draft.trim() }
          }
        />

        <EditableRow
          {...row('seniority')}
          label="Seniority"
          value={profile.seniority && SENIORITY_LABELS[profile.seniority]}
          initialDraft={profile.seniority}
          renderEditor={(draft, setDraft) => (
            <RowSelect
              label="Seniority"
              items={SENIORITY_ITEMS}
              value={draft}
              onChange={setDraft}
            />
          )}
          buildRequest={(draft) => ({ seniority: draft })}
        />

        <EditableRow
          {...row('yearsExperience')}
          label="Experience"
          value={years === null ? null : `${String(years)} years`}
          initialDraft={years === null ? '' : String(years)}
          renderEditor={(draft, setDraft) => (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                aria-label="Years of experience"
                type="number"
                inputMode="decimal"
                min={0}
                max={MAX_YEARS}
                step={0.5}
                className={`${FIELD_CLASS} w-24`}
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                }}
              />
              <span className="text-ink-muted">years</span>
            </div>
          )}
          buildRequest={(draft) => {
            if (draft.trim() === '') return { yearsExperience: null };
            const value = Number(draft);
            if (!Number.isFinite(value) || value < 0 || value > MAX_YEARS) {
              return [
                `Experience must be between 0 and ${String(MAX_YEARS)} years.`,
              ];
            }
            // The backend stores one decimal.
            return { yearsExperience: Math.round(value * 10) / 10 };
          }}
        />

        <EditableRow<LookupOption | null>
          {...row('location')}
          label="Based in"
          value={location?.label}
          initialDraft={location}
          renderEditor={(draft, setDraft) => (
            <LookupField
              label="Search your city or region"
              placeholder="e.g. Berlin"
              selected={draft ? [draft] : []}
              max={1}
              search={searchLocationOptions}
              onChange={(next) => {
                setDraft(next[0] ?? null);
              }}
            />
          )}
          buildRequest={(draft) =>
            draft === null
              ? ['Location is required.']
              : { locationId: draft.value }
          }
        />
      </dl>
    </ProfileSectionCard>
  );
}
