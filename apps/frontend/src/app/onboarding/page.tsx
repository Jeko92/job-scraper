import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { getProfile } from '@/lib/profile/profile';
import { HOME_HREF, LOGIN_HREF } from '@/lib/routes';

export const metadata: Metadata = { title: 'Onboarding' };

export default async function OnboardingPage() {
  const profile = await getProfile();
  if (!profile) redirect(LOGIN_HREF);
  if (profile.onboardingCompleted) redirect(HOME_HREF);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <OnboardingFlow profile={profile} />
    </main>
  );
}
