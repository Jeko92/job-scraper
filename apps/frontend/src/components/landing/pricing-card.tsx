import { Check } from 'lucide-react';
import Link from 'next/link';

import {
  currentPrice,
  formatEuro,
  formatOfferEnd,
  type PricingTier,
} from '@/lib/landing/pricing';
import { REGISTER_HREF } from '@/lib/routes';
import { overline } from '@/lib/styles';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  tier: PricingTier;
  now: Date;
}

export function PricingCard({ tier, now }: PricingCardProps) {
  const { price, regularPrice, discountPercent, offerEnds } = currentPrice(
    tier,
    now,
  );
  const featured = tier.recommended === true;

  return (
    <li
      className={cn(
        'flex flex-col gap-6 rounded-card border p-6 lg:p-8',
        featured
          ? 'border-surface-alt bg-surface-alt text-on-alt'
          : 'border-line bg-bg text-ink',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-heading text-2xl leading-8 font-semibold">
          {tier.name}
        </h3>
        {featured && (
          <span
            className={cn(
              overline,
              'rounded-pill bg-highlight px-3 py-1 text-on-highlight',
            )}
          >
            Recommended
          </span>
        )}
      </div>
      <p className={featured ? 'text-on-alt-muted' : 'text-ink-muted'}>
        {tier.summary}
      </p>

      <div className="flex flex-col gap-2">
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-heading text-5xl leading-none">
            {formatEuro(price)}
          </span>
          <span className={featured ? 'text-on-alt-muted' : 'text-ink-muted'}>
            / month
          </span>
          {regularPrice !== null && (
            <s className={featured ? 'text-on-alt-muted' : 'text-ink-muted'}>
              <span className="sr-only">Regular price </span>
              {formatEuro(regularPrice)}
            </s>
          )}
        </p>
        {discountPercent !== null && offerEnds !== null && (
          <p className="text-sm">
            <span className="mr-2 rounded-chip bg-status-done px-2 py-0.5 font-semibold text-on-status">
              −{discountPercent}%
            </span>
            Launch price until {formatOfferEnd(offerEnds)}, then{' '}
            {formatEuro(regularPrice ?? price)} / month.
          </p>
        )}
      </div>

      <ul className="flex flex-1 flex-col gap-3">
        {tier.features.map((feature) => (
          <li key={feature} className="flex gap-3">
            <Check
              className="mt-0.5 size-5 shrink-0 text-highlight"
              aria-hidden="true"
            />
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href={REGISTER_HREF}
        className={cn(
          'inline-flex h-11 items-center justify-center rounded-pill px-5 font-semibold outline-none focus-visible:ring-3 focus-visible:ring-focus/50',
          featured
            ? 'bg-highlight text-on-highlight'
            : 'bg-primary text-primary-foreground',
        )}
      >
        Choose {tier.name}
      </Link>
    </li>
  );
}
