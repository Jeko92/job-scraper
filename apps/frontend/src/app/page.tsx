import { Hero } from '@/components/landing/hero';
import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { getSession } from '@/lib/auth/session';

export default async function HomePage() {
  if (await getSession()) {
    return <PagePlaceholder title="Home" />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-warm">
      <main className="flex-1">
        <Hero />
      </main>
    </div>
  );
}
