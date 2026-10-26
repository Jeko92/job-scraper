import { HomeOverview } from '@/components/home/home-overview';
import { Hero } from '@/components/landing/hero';
import { getSession } from '@/lib/auth/session';

export default async function HomePage() {
  if (await getSession()) {
    return <HomeOverview />;
  }

  return (
    <main className="flex-1 pb-8">
      <Hero />
    </main>
  );
}
