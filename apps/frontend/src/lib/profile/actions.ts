'use server';

import {
  type UpdateUserProfileRequest,
  updateUserProfileSchema,
  userProfileSchema,
} from '@job-scraper/shared';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AUTH_COOKIE } from '@/lib/auth/cookie';
import { patchToBackend, readErrorMessages } from '@/lib/backend';
import { LOGIN_HREF, PROFILE_HREF } from '@/lib/routes';

const SAVE_FAILED = "Couldn't save, try again";

export interface SubmitOnboardingState {
  errors: string[];
}

export async function submitOnboarding(
  input: UpdateUserProfileRequest,
): Promise<SubmitOnboardingState> {
  const parsed = updateUserProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      errors: parsed.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    };
  }

  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (token === undefined) {
    redirect(LOGIN_HREF);
  }

  try {
    const response = await patchToBackend(
      '/users/me/profile',
      token,
      parsed.data,
    );
    if (!response.ok) {
      return { errors: await readErrorMessages(response) };
    }
    const profile = userProfileSchema.safeParse(await response.json());
    if (!profile.success || !profile.data.onboardingCompleted) {
      return { errors: ['Please add your role and where you are based.'] };
    }
  } catch {
    return { errors: [SAVE_FAILED] };
  }

  redirect(PROFILE_HREF);
}
