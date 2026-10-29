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

export type PatchProfileResult =
  { ok: true; profile: UserProfile } | { ok: false; errors: string[] };

export async function patchProfile(
  input: UpdateUserProfileRequest,
): Promise<PatchProfileResult> {
  const parsed = updateUserProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
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
      return { ok: false, errors: await readErrorMessages(response) };
    }
    const profile = userProfileSchema.safeParse(await response.json());
    if (!profile.success) {
      return { ok: false, errors: [SAVE_FAILED] };
    }
    return { ok: true, profile: profile.data };
  } catch {
    return { ok: false, errors: [SAVE_FAILED] };
  }
}

export async function submitOnboarding(
  input: UpdateUserProfileRequest,
): Promise<SubmitOnboardingState> {
  const result = await patchProfile(input);
  if (!result.ok) {
    return { errors: result.errors };
  }
  if (!result.profile.onboardingCompleted) {
    return { errors: ['Please add your role and where you are based.'] };
  }

  redirect(HOME_HREF);
}
