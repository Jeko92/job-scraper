'use client';

import { MAX_PROFILE_INDUSTRIES } from '@job-scraper/shared';

import { toIndustryOption } from '@/lib/lookups/options';
import { searchIndustryOptions } from '@/lib/lookups/search';

import type { SectionProps } from '../common/editable-row';
import { LookupRow } from '../common/lookup-row';

export function IndustriesSection({ profile, row }: SectionProps) {
  return (
    <LookupRow
      {...row('industries')}
      label="Industries"
      addLabel="Add industry"
      searchLabel="Search industries"
      placeholder="e.g. Finance"
      options={profile.industries.map(toIndustryOption)}
      max={MAX_PROFILE_INDUSTRIES}
      numbered
      search={searchIndustryOptions}
      buildRequest={(ids) => ({ industries: ids })}
    />
  );
}
