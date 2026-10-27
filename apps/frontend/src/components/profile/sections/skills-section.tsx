'use client';

import { MAX_PROFILE_SKILLS } from '@job-scraper/shared';

import { toSkillOption } from '@/lib/lookups/options';
import { searchSkillOptions } from '@/lib/lookups/search';

import type { SectionProps } from '../common/editable-row';
import { LookupRow } from '../common/lookup-row';

export function SkillsSection({ profile, row }: SectionProps) {
  return (
    <LookupRow
      {...row('skills')}
      label="Skills"
      addLabel="Add skill"
      searchLabel="Search skills"
      placeholder="e.g. React"
      options={profile.skills.map(toSkillOption)}
      max={MAX_PROFILE_SKILLS}
      search={searchSkillOptions}
      buildRequest={(slugs) => ({ skills: slugs.map((slug) => ({ slug })) })}
    />
  );
}
