import Link from 'next/link';
import { redirect } from 'next/navigation';

import { LoginForm } from '@/components/auth/login-form';
import { getSession } from '@/lib/auth/session';

export default async function LoginPage() {
  if (await getSession()) {
    redirect('/');
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Log in</h1>
          <p className="mt-2 text-muted-foreground">
            Use your JobScraper username and password.
          </p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No account yet?{' '}
          <Link href="/register" className="text-foreground hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
