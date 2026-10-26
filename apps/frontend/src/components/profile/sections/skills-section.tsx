'use client';

import { MAX_PROFILE_SKILLS, type UserProfile } from '@job-scraper/shared';

import { LookupField } from '@/components/lookups/lookup-field';
import { toSkillOption } from '@/lib/lookups/options';
import { searchSkillOptions } from '@/lib/lookups/search';
import type { LookupOption } from '@/lib/lookups/types';

import { EditableRow, type RowControl } from '../common/editable-row';
import { ProfileSectionCard } from '../common/section-card';

interface SkillsSectionProps {
  profile: UserProfile;
  row: (id: string) => RowControl;
}

export function SkillsSection({ profile, row }: SkillsSectionProps) {
  const skills = profile.skills.map(toSkillOption);

  return (
    <ProfileSectionCard title="Skills">
      <dl className="divide-y divide-line">
        <EditableRow<LookupOption[]>
          {...row('skills')}
          label="Skills"
          value={skills.map((skill) => skill.label).join(' · ')}
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
      </dl>
    </ProfileSectionCard>
  );
}
