'use client';

import { MAX_PROFILE_INDUSTRIES, type UserProfile } from '@job-scraper/shared';

import { LookupField } from '@/components/lookups/lookup-field';
import { toIndustryOption } from '@/lib/lookups/options';
import { searchIndustryOptions } from '@/lib/lookups/search';
import type { LookupOption } from '@/lib/lookups/types';

import { ChipList } from '../common/chip-list';
import { EditableRow, type RowControl } from '../common/editable-row';

interface IndustriesSectionProps {
  profile: UserProfile;
  row: (id: string) => RowControl;
}

export function IndustriesSection({ profile, row }: IndustriesSectionProps) {
  const industries = profile.industries.map(toIndustryOption);

  return (
    <EditableRow<LookupOption[]>
      {...row('industries')}
      label="Industries"
      addLabel="Add industry"
      // The order is the priority: "1. Finance", "2. Software".
      value={
        industries.length > 0 ? (
          <ChipList
            numbered
            labels={industries.map((industry) => industry.label)}
          />
        ) : null
      }
      initialDraft={industries}
      renderEditor={(draft, setDraft) => (
        <LookupField
          label="Search industries"
          placeholder="e.g. Finance"
          selected={draft}
          max={MAX_PROFILE_INDUSTRIES}
          numbered
          search={searchIndustryOptions}
          onChange={setDraft}
        />
      )}
      buildRequest={(draft) => ({
        industries: draft.map((option) => option.value),
      })}
    />
  );
}
