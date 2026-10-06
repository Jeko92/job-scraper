import { Greeting } from '@/components/greeting';
import { fetchBackendGreeting } from '@/lib/backend';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const backendMessage = await fetchBackendGreeting();

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Greeting backendMessage={backendMessage} />
    </main>
  );
}
