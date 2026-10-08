'use server';

import { loginRequestSchema, loginResponseSchema } from '@job-scraper/shared';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { postToBackend } from '@/lib/backend';
import { getAuthCookieMaxAge } from '@/lib/env';

import { AUTH_COOKIE } from './cookie';

export interface AuthFormState {
  error: string;
}

export async function login(
  _state: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState | undefined> {
  const credentials = loginRequestSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  });
  if (!credentials.success) {
    return { error: 'Please enter your username and password.' };
  }

  let token: string;
  try {
    const response = await postToBackend('/auth/login', credentials.data);
    if (!response.ok) {
      return { error: 'Invalid username or password.' };
    }
    const body = loginResponseSchema.safeParse(await response.json());
    if (!body.success) {
      return { error: 'Unexpected answer from the server. Please try again.' };
    }
    token = body.data.access_token;
  } catch {
    return { error: 'The server is not reachable. Please try again.' };
  }

  const maxAge = getAuthCookieMaxAge();
  (await cookies()).set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    ...(maxAge === undefined ? {} : { maxAge }),
  });
  redirect('/');
}

export async function logout(): Promise<void> {
  (await cookies()).delete(AUTH_COOKIE);
  redirect('/');
}
