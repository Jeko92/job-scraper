import { Hero } from '@/components/landing/hero';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-warm">
      <main className="flex-1">
        <Hero />
      </main>
    </div>
  );
}
