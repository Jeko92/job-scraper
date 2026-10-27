'use client';

import { MAX_PROFILE_INDUSTRIES } from '@job-scraper/shared';

import { LookupField } from '@/components/lookups/lookup-field';
import { searchIndustryOptions } from '@/lib/lookups/search';
import type { LookupOption } from '@/lib/lookups/types';

import { StepShell } from './common/step-shell';

interface IndustriesStepProps {
  number: number;
  selected: LookupOption[];
  onChange: (industries: LookupOption[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function IndustriesStep({
  number,
  selected,
  onChange,
  onNext,
  onBack,
}: IndustriesStepProps) {
  return (
    <StepShell
      tag="Industries"
      number={number}
      title="Which industries interest you?"
      subtitle={`Pick up to ${String(MAX_PROFILE_INDUSTRIES)}. The first one is the most important.`}
      onNext={onNext}
      onSkip={onNext}
      onBack={onBack}
    >
      <LookupField
        label="Search industries"
        placeholder="e.g. Finance"
        selected={selected}
        max={MAX_PROFILE_INDUSTRIES}
        search={searchIndustryOptions}
        onChange={onChange}
        numbered
        suggestWhenEmpty
      />
    </StepShell>
  );
}
