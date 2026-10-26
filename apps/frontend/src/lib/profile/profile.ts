import { type UserProfile, userProfileSchema } from '@job-scraper/shared';
import { cache } from 'react';

import { getParsedFromBackend } from '@/lib/backend';

export const getProfile = cache((): Promise<UserProfile | null> =>
  getParsedFromBackend('/users/me/profile', userProfileSchema),
);
