'use client';

import { SENIORITY_LEVELS, type UserProfile } from '@job-scraper/shared';

import { LookupField } from '@/components/lookups/lookup-field';
import { Input } from '@/components/ui/input';
import { SENIORITY_LABELS } from '@/lib/common/enum-labels';
import { toLocationOption } from '@/lib/lookups/options';
import { searchLocationOptions } from '@/lib/lookups/search';
import type { LookupOption } from '@/lib/lookups/types';

import {
  EditableRow,
  type RowControl,
  type RowId,
} from '../common/editable-row';
import { enumItems, RowSelect } from '../common/row-select';

const FIELD_CLASS = 'h-12 rounded-card px-4 text-base';
const MAX_YEARS = 99.9;

const SENIORITY_ITEMS = enumItems(SENIORITY_LEVELS, SENIORITY_LABELS);

interface BasicInfoSectionProps {
  profile: UserProfile;
  row: (id: RowId) => RowControl;
}

export function BasicInfoSection({ profile, row }: BasicInfoSectionProps) {
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
  const years = profile.yearsExperience;
  const location = profile.location ? toLocationOption(profile.location) : null;

  return (
    <>
      <EditableRow
        {...row('name')}
        label="Full name"
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
        buildRequest={(draft) => {
          const firstName = draft.firstName.trim();
          const lastName = draft.lastName.trim();
          const errors: string[] = [];
          if (firstName === '') errors.push('First name is required.');
          if (lastName === '') errors.push('Last name is required.');
          return errors.length > 0 ? errors : { firstName, lastName };
        }}
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
              type="text"
              inputMode="decimal"
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
          const text = draft.trim();
          if (text === '') return { yearsExperience: null };
          // Digits with an optional decimal part; "1,5" is read as 1.5.
          if (!/^\d+([.,]\d+)?$/.test(text)) {
            return ['Enter a number of years, e.g. 2.5.'];
          }
          const value = Number(text.replace(',', '.'));
          if (value > MAX_YEARS) {
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
    </>
  );
}
