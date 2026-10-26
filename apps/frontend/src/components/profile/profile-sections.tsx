'use client';

import type { UserProfile } from '@job-scraper/shared';

import { BasicInfoSection } from './sections/basic-info-section';

interface OnboardingFlowProps {
  profile: UserProfile;
}
export function ProfileSections({ profile }: OnboardingFlowProps) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <BasicInfoSection
        profile={profile}
        onEdit={() => {
          // Edit mode comes in a later step
        }}
      />
    </div>
  );
}
