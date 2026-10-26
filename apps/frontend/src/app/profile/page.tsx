import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ProfileSections } from '@/components/profile/profile-sections';
import { getProfile } from '@/lib/profile/profile';
import { LOGIN_HREF, ONBOARDING_HREF } from '@/lib/routes';

export const metadata: Metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) redirect(LOGIN_HREF);
  if (!profile.onboardingCompleted) redirect(ONBOARDING_HREF);

  return (
    <main className="flex-1 p-6">
      <ProfileSections profile={profile} />
    </main>
  );
}
