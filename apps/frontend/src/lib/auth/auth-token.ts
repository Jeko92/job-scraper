import { cookies } from 'next/headers';

import { AUTH_COOKIE } from './cookie';

/** Reads the login token for backend calls; never writes the cookie. */
export async function readAuthToken(): Promise<string | undefined> {
  return (await cookies()).get(AUTH_COOKIE)?.value;
}
