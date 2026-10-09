import { CtaSection } from '@/components/landing/cta-section';
import { FeaturesBento } from '@/components/landing/features-bento';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { MetricsRings } from '@/components/landing/metrics-rings';
import { MissionQuote } from '@/components/landing/mission-quote';
import { SiteFooter } from '@/components/landing/site-footer';
import { SiteHeader } from '@/components/landing/site-header';
import { getSession } from '@/lib/auth/session';

export default async function HomePage() {
  const user = await getSession();
  console.log('user', user);

  return (
    <div className="flex min-h-screen flex-col bg-surface-warm">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <MissionQuote />
        <FeaturesBento />
        <MetricsRings />
        <HowItWorks />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
