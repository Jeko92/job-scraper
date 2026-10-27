import type { UserProfile } from '@job-scraper/shared';

import { toLocationOption } from '@/lib/lookups/options';

import { ProfileTile } from './common/profile-tile';

interface ProfileSummaryProps {
  profile: UserProfile;
}

export function ProfileSummary({ profile }: ProfileSummaryProps) {
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
  const initials = [profile.firstName, profile.lastName]
    .map((part) => part?.charAt(0) ?? '')
    .join('')
    .toUpperCase();
  const subtitle = [
    profile.headline,
    profile.location && toLocationOption(profile.location).label,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <ProfileTile title="Your profile">
      <div className="space-y-4">
        <div
          aria-hidden="true"
          className="flex size-24 items-center justify-center rounded-full bg-highlight font-heading text-4xl text-on-highlight"
        >
          {initials}
        </div>
        <div className="space-y-1">
          <p className="font-heading text-4xl break-words text-ink">{name}</p>
          {subtitle && <p className="text-ink-muted">{subtitle}</p>}
        </div>
      </div>
    </ProfileTile>
  );
}
