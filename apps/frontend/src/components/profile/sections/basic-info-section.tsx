import type { UserProfile } from '@job-scraper/shared';

import { toLocationOption } from '@/lib/lookups/options';
import { SENIORITY_LABELS } from '@/lib/profile/enum-labels';

import { ProfileRow } from '../profile-row';
import { ProfileSectionCard } from '../profileSection-card';

interface BasicInfoSectionProps {
  profile: UserProfile;
  onEdit: () => void;
}

export function BasicInfoSection({ profile, onEdit }: BasicInfoSectionProps) {
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
  const years = profile.yearsExperience;

  return (
    <ProfileSectionCard title="Basic info" onEdit={onEdit}>
      <dl className="divide-y divide-line">
        <ProfileRow label="Name" value={name} />
        <ProfileRow label="Role" value={profile.headline} />
        <ProfileRow
          label="Seniority"
          value={profile.seniority && SENIORITY_LABELS[profile.seniority]}
        />
        <ProfileRow
          label="Experience"
          value={years === null ? null : `${String(years)} years`}
        />
        <ProfileRow
          label="Based in"
          value={profile.location && toLocationOption(profile.location).label}
        />
      </dl>
    </ProfileSectionCard>
  );
}
