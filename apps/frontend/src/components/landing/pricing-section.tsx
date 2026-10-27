import { PRICING_TIERS } from '@/lib/landing/pricing';

import { LandingSection } from './landing-section';
import { PricingCard } from './pricing-card';

export function PricingSection() {
  // One timestamp so every card agrees on whether the offer still runs.
  const now = new Date();

  return (
    <LandingSection
      id="pricing"
      chip="Pricing"
      title={
        <>
          Launch prices for early members.{' '}
          <span className="text-ink-muted">Pick the plan that fits.</span>
        </>
      }
    >
      <ul className="grid gap-2 md:grid-cols-3">
        {PRICING_TIERS.map((tier) => (
          <PricingCard key={tier.id} tier={tier} now={now} />
        ))}
      </ul>
      <p className="text-sm text-ink-muted">
        All prices per month, VAT included.
      </p>
    </LandingSection>
  );
}
