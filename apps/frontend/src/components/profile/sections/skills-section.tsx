'use client';

import { MAX_PROFILE_SKILLS, type UserProfile } from '@job-scraper/shared';

import { LookupField } from '@/components/lookups/lookup-field';
import { toSkillOption } from '@/lib/lookups/options';
import { searchSkillOptions } from '@/lib/lookups/search';
import type { LookupOption } from '@/lib/lookups/types';

import { ChipList } from '../common/chip-list';
import {
  EditableRow,
  type RowControl,
  type RowId,
} from '../common/editable-row';

interface SkillsSectionProps {
  profile: UserProfile;
  row: (id: RowId) => RowControl;
}

export function SkillsSection({ profile, row }: SkillsSectionProps) {
  const skills = profile.skills.map(toSkillOption);

  return (
    <EditableRow<LookupOption[]>
      {...row('skills')}
      label="Skills"
      addLabel="Add skill"
      // null when empty, so the row shows "Not set".
      value={
        skills.length > 0 ? (
          <ChipList labels={skills.map((skill) => skill.label)} />
        ) : null
      }
      initialDraft={skills}
      renderEditor={(draft, setDraft) => (
        <LookupField
          label="Search skills"
          placeholder="e.g. React"
          selected={draft}
          max={MAX_PROFILE_SKILLS}
          search={searchSkillOptions}
          onChange={setDraft}
        />
      )}
      buildRequest={(draft) => ({
        skills: draft.map((option) => ({ slug: option.value })),
      })}
    />
  );
}
