'use client';

import { MAX_PROFILE_INDUSTRIES, type UserProfile } from '@job-scraper/shared';

import { LookupField } from '@/components/lookups/lookup-field';
import { toIndustryOption } from '@/lib/lookups/options';
import { searchIndustryOptions } from '@/lib/lookups/search';
import type { LookupOption } from '@/lib/lookups/types';

import { EditableRow, type RowControl } from '../common/editable-row';
import { ProfileSectionCard } from '../common/section-card';

interface IndustriesSectionProps {
  profile: UserProfile;
  row: (id: string) => RowControl;
}

export function IndustriesSection({ profile, row }: IndustriesSectionProps) {
  const industries = profile.industries.map(toIndustryOption);

  return (
    <ProfileSectionCard title="Industries">
      <dl className="divide-y divide-line">
        <EditableRow<LookupOption[]>
          {...row('industries')}
          label="Industries"
          // The order is the priority: "1. Finance · 2. Software".
          value={industries
            .map((industry, index) => `${String(index + 1)}. ${industry.label}`)
            .join(' · ')}
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
      </dl>
    </ProfileSectionCard>
  );
}
