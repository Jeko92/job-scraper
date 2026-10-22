import { cookies } from 'next/headers';

import { AUTH_COOKIE } from './cookie';

/** Reads the login token for backend calls; never writes the cookie. */
export async function readAuthToken(): Promise<string | undefined> {
  return (await cookies()).get(AUTH_COOKIE)?.value;
}

/** Like `readAuthToken`, but throws when the user is not logged in. */
export async function requireAuthToken(): Promise<string> {
  const token = await readAuthToken();
  if (token === undefined) {
    throw new Error('Not logged in');
  }
  return token;
}
