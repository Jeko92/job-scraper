'use client';

import { MAX_PROFILE_SKILLS } from '@job-scraper/shared';

import { LookupField } from '@/components/lookups/lookup-field';
import { searchSkillOptions } from '@/lib/lookups/search';
import type { LookupOption } from '@/lib/lookups/types';

import { StepShell } from './common/step-shell';

interface SkillsStepProps {
  number: number;
  selected: LookupOption[];
  onChange: (skills: LookupOption[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SkillsStep({
  number,
  selected,
  onChange,
  onNext,
  onBack,
}: SkillsStepProps) {
  return (
    <StepShell
      tag="Skills"
      number={number}
      title="Which skills do you bring?"
      subtitle="Add the tools and languages you work with. We match jobs on them."
      onNext={onNext}
      onSkip={onNext}
      onBack={onBack}
    >
      <LookupField
        label="Search skills"
        placeholder="e.g. React"
        selected={selected}
        max={MAX_PROFILE_SKILLS}
        search={searchSkillOptions}
        onChange={onChange}
      />
    </StepShell>
  );
}
