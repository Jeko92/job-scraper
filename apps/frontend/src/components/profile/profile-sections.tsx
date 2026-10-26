'use client';

import type { UserProfile } from '@job-scraper/shared';
import { useEffect, useState } from 'react';

import type { RowControl } from './common/editable-row';
import { BasicInfoSection } from './sections/basic-info-section';
import { IndustriesSection } from './sections/industries-section';
import { PreferencesSection } from './sections/preferences-section';
import { SkillsSection } from './sections/skills-section';

interface ProfileSectionsProps {
  profile: UserProfile;
}

export function ProfileSections({
  profile: initialProfile,
}: ProfileSectionsProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [openRow, setOpenRow] = useState<string | null>(null);

  // Warn before closing or reloading the tab while a row is open.
  useEffect(() => {
    if (openRow === null) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => {
      window.removeEventListener('beforeunload', warn);
    };
  }, [openRow]);

  function row(id: string): RowControl {
    return {
      isOpen: openRow === id,
      editDisabled: openRow !== null && openRow !== id,
      onEdit: () => {
        setOpenRow(id);
      },
      onClose: () => {
        setOpenRow(null);
      },
      onSaved: (saved) => {
        setProfile(saved);
        setOpenRow(null);
      },
    };
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <BasicInfoSection profile={profile} row={row} />
      <PreferencesSection profile={profile} row={row} />
      <SkillsSection profile={profile} row={row} />
      <IndustriesSection profile={profile} row={row} />
    </div>
  );
}
