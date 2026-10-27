'use server';

import { jobIdSchema } from '@job-scraper/shared';
import { refresh } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AUTH_COOKIE } from '@/lib/auth/cookie';
import {
  deleteFromBackend,
  putToBackend,
  readErrorMessages,
} from '@/lib/backend';
import { LOGIN_HREF } from '@/lib/routes';

const SAVE_FAILED = "Couldn't update saved jobs, try again";

export interface SetJobSavedState {
  errors: string[];
}

/** Saves or unsaves a job for the current user, then refreshes the page. */
export async function setJobSaved(
  jobId: string,
  saved: boolean,
): Promise<SetJobSavedState> {
  if (!jobIdSchema.safeParse(jobId).success) {
    return { errors: [SAVE_FAILED] };
  }

  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (token === undefined) {
    redirect(LOGIN_HREF);
  }

  const path = `/users/me/save-jobs/${jobId}`;
  try {
    const response = saved
      ? await putToBackend(path, token)
      : await deleteFromBackend(path, token);
    if (!response.ok) {
      return { errors: await readErrorMessages(response) };
    }
  } catch {
    return { errors: [SAVE_FAILED] };
  }

  refresh();
  return { errors: [] };
}
