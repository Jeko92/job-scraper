'use server';

import {
  createRegisterRequestSchema,
  loginRequestSchema,
  loginResponseSchema,
} from '@job-scraper/shared';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { postToBackend, readErrorMessages } from '@/lib/backend';
import { getAuthCookieMaxAge, getPasswordMinLength } from '@/lib/env';

import { AUTH_COOKIE } from './cookie';

const UNREACHABLE = 'The server is not reachable. Please try again.';

export interface LoginFormState {
  errors: string[];
}

export interface RegisterFormState {
  errors: string[];
  values: { firstName: string; lastName: string; username: string };
}

export async function login(
  _state: LoginFormState | undefined,
  formData: FormData,
): Promise<LoginFormState | undefined> {
  const credentials = loginRequestSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  });
  if (!credentials.success) {
    return { errors: ['Please enter your username and password.'] };
  }

  let token: string;
  try {
    const response = await postToBackend('/auth/login', credentials.data);
    if (!response.ok) {
      return { errors: ['Invalid username or password.'] };
    }
    const body = loginResponseSchema.safeParse(await response.json());
    if (!body.success) {
      return {
        errors: ['Unexpected answer from the server. Please try again.'],
      };
    }
    token = body.data.access_token;
  } catch {
    return { errors: [UNREACHABLE] };
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

export async function register(
  _state: RegisterFormState | undefined,
  formData: FormData,
): Promise<RegisterFormState | undefined> {
  const values = {
    firstName: readText(formData, 'firstName'),
    lastName: readText(formData, 'lastName'),
    username: readText(formData, 'username'),
  };
  const input = { ...values, password: readText(formData, 'password') };

  const passwordMinLength = getPasswordMinLength();
  if (passwordMinLength !== undefined) {
    const parsed =
      createRegisterRequestSchema(passwordMinLength).safeParse(input);
    if (!parsed.success) {
      return {
        errors: parsed.error.issues.map(
          (issue) => `${issue.path.join('.')}: ${issue.message}`,
        ),
        values,
      };
    }
  }

  try {
    const response = await postToBackend('/auth/register', input);
    if (!response.ok) {
      return { errors: await readErrorMessages(response), values };
    }
  } catch {
    return { errors: [UNREACHABLE], values };
  }

  const loginState = await login(undefined, formData);
  return loginState && { ...loginState, values };
}

export async function logout(): Promise<void> {
  (await cookies()).delete(AUTH_COOKIE);
  redirect('/');
}

function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}
