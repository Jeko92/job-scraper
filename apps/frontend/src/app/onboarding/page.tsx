import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { getSession } from '@/lib/auth/session';
import { getProfile } from '@/lib/profile/profile';
import { HOME_HREF, LOGIN_HREF } from '@/lib/routes';

export const metadata: Metadata = { title: 'Onboarding' };

export default async function OnboardingPage() {
  if (!(await getSession())) redirect(LOGIN_HREF);
  const profile = await getProfile();
  if (!profile) throw new Error('Loading the profile failed');
  if (profile.onboardingCompleted) redirect(HOME_HREF);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <OnboardingFlow profile={profile} />
    </main>
  );
}
