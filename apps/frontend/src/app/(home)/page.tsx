import { HomeOverview } from '@/components/home/home-overview';
import { Hero } from '@/components/landing/hero';
import { getSession } from '@/lib/auth/session';

export default async function HomePage() {
  const user = await getSession();
  if (user) {
    return <HomeOverview user={user} />;
  }

  return (
    <main className="flex-1 pb-8">
      <Hero />
    </main>
  );
}
