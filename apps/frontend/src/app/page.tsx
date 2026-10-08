import { Greeting } from '@/components/greeting';
import { getSession } from '@/lib/auth/session';
import { fetchBackendGreeting } from '@/lib/backend';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getSession();

  if (user) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <h1 className="text-3xl font-bold text-foreground">
          Hello, {user.username}
        </h1>
      </main>
    );
  }

  const backendMessage = await fetchBackendGreeting();

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Greeting backendMessage={backendMessage} />
    </main>
  );
}
