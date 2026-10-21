import { type UserProfile, userProfileSchema } from '@job-scraper/shared';
import { cookies } from 'next/headers';
import { cache } from 'react';

import { AUTH_COOKIE } from '@/lib/auth/cookie';
import { getFromBackend } from '@/lib/backend';

export const getProfile = cache(async (): Promise<UserProfile | null> => {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (token === undefined) {
    return null;
  }

  try {
    const response = await getFromBackend('/users/me/profile', token);
    if (!response.ok) {
      return null;
    }
    const profile = userProfileSchema.safeParse(await response.json());
    return profile.success ? profile.data : null;
  } catch {
    return null;
  }
});
