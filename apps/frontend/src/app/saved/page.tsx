import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { getSession } from '@/lib/auth/session';
import { LOGIN_HREF } from '@/lib/routes';

export const metadata: Metadata = { title: 'Saved' };

export default async function SavedPage() {
  if (!(await getSession())) {
    redirect(LOGIN_HREF);
  }

  return <PagePlaceholder title="Saved" />;
}
