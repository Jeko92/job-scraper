import Link from 'next/link';
import { redirect } from 'next/navigation';

import { RegisterForm } from '@/components/auth/register-form';
import { getSession } from '@/lib/auth/session';
import { getPasswordMinLength } from '@/lib/env';

export default async function RegisterPage() {
  if (await getSession()) {
    redirect('/');
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Create an account
          </h1>
          <p className="mt-2 text-muted-foreground">
            Register to start using JobScraper.
          </p>
        </div>
        <RegisterForm passwordMinLength={getPasswordMinLength()} />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-foreground hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
