import { Hero } from '@/components/landing/hero';
import { NewsletterSection } from '@/components/landing/newsletter-section';
import { PerksSection } from '@/components/landing/perks-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { ProblemSection } from '@/components/landing/problem-section';
import { SolutionSection } from '@/components/landing/solution-section';
import { TrustSection } from '@/components/landing/trust-section';
import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { getSession } from '@/lib/auth/session';

export default async function HomePage() {
  if (await getSession()) {
    return <PagePlaceholder title="Home" />;
  }

  return (
    <main className="flex flex-1 flex-col gap-2 pb-8">
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <PerksSection />
      <TrustSection />
      <PricingSection />
      <NewsletterSection />
    </main>
  );
}
