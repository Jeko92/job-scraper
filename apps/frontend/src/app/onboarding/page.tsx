import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { getSession } from '@/lib/auth/session';
import { getProfile } from '@/lib/profile/profile';
import { LOGIN_HREF, PROFILE_HREF } from '@/lib/routes';
export const metadata: Metadata = { title: 'onboarding' };

export default async function SearchPage() {
  if (!(await getSession())) {
    redirect(LOGIN_HREF);
  }
  const profile = await getProfile();
  if (!profile) redirect(LOGIN_HREF);
  if (profile.onboardingCompleted) redirect(PROFILE_HREF);

  return <PagePlaceholder title="onboarding" />;
}
