import { type AuthUser, authUserSchema } from '@job-scraper/shared';
import { cookies } from 'next/headers';
import { cache } from 'react';

import { getFromBackend } from '@/lib/backend';

import { AUTH_COOKIE } from './cookie';

export const getSession = cache(async (): Promise<AuthUser | null> => {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (token === undefined) {
    return null;
  }

  try {
    const response = await getFromBackend('/auth/me', token);
    if (!response.ok) {
      return null;
    }
    const user = authUserSchema.safeParse(await response.json());
    return user.success ? user.data : null;
  } catch {
    return null;
  }
});
