import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { SubmitOnboardingButton } from '@/components/onboarding/submit-onboarding-button';
import { getProfile } from '@/lib/profile/profile';
import { LOGIN_HREF, PROFILE_HREF } from '@/lib/routes';

export const metadata: Metadata = { title: 'Onboarding' };

export default async function SearchPage() {
  const profile = await getProfile();
  if (!profile) redirect(LOGIN_HREF);
  if (profile.onboardingCompleted) redirect(PROFILE_HREF);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <SubmitOnboardingButton
        answers={{
          headline: 'Fullstack developer',
          locationId: '47f03b00-eeae-4bcc-8c84-c71505c0e90a',
        }}
      />
    </main>
  );
}
