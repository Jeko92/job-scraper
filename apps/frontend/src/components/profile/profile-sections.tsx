'use client';

import type { UserProfile } from '@job-scraper/shared';

import { ProfileSectionCard } from './profileSection-card';

interface OnboardingFlowProps {
  profile: UserProfile;
}
export function ProfileSections({ profile }: OnboardingFlowProps) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <ProfileSectionCard
        title="Basic info"
        onEdit={() => {
          // Edit mode comes in a later step
        }}
      >
        {profile.headline}
      </ProfileSectionCard>
    </div>
  );
}
