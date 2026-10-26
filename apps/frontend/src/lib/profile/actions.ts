'use server';

import {
  type UpdateUserProfileRequest,
  updateUserProfileSchema,
  type UserProfile,
  userProfileSchema,
} from '@job-scraper/shared';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AUTH_COOKIE } from '@/lib/auth/cookie';
import { patchToBackend, readErrorMessages } from '@/lib/backend';
import { HOME_HREF, LOGIN_HREF } from '@/lib/routes';

const SAVE_FAILED = "Couldn't save, try again";

export interface SubmitOnboardingState {
  errors: string[];
}

export interface SubmitProfileResult {
  errors: string[];
  profile: UserProfile | null;
}

async function patchProfile(
  input: UpdateUserProfileRequest,
): Promise<SubmitProfileResult> {
  const parsed = updateUserProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      errors: parsed.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
      profile: null,
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
      return { errors: await readErrorMessages(response), profile: null };
    }
    const profile = userProfileSchema.safeParse(await response.json());
    if (!profile.success) {
      return { errors: [SAVE_FAILED], profile: null };
    }
    return { errors: [], profile: profile.data };
  } catch {
    return { errors: [SAVE_FAILED], profile: null };
  }
}

export async function submitOnboarding(
  input: UpdateUserProfileRequest,
): Promise<SubmitOnboardingState> {
  const { errors, profile } = await patchProfile(input);
  if (errors.length > 0) {
    return { errors };
  }
  if (!profile?.onboardingCompleted) {
    return { errors: ['Please add your role and where you are based.'] };
  }

  redirect(HOME_HREF);
}

// Profile page: one section per call
export async function submitProfile(
  input: UpdateUserProfileRequest,
): Promise<SubmitProfileResult> {
  return patchProfile(input);
}
