/**
 * Landing page price plans. Names, prices and features are drafts.
 *
 * Discounts must hold up under PAngV §11 and UWG §5: every offer names the
 * price it is measured against and has a real end date. Before launch there
 * is no earlier price, so offers are introductory prices and the regular
 * price applies once they end. Never push `until` forward to keep an offer
 * running.
 */
export interface PricingTier {
  id: string;
  name: string;
  summary: string;
  /** Monthly gross price in EUR, VAT included. */
  regularPrice: number;
  offer?: PriceOffer;
  features: string[];
  recommended?: boolean;
}

export interface PriceOffer {
  price: number;
  /** ISO timestamp with offset; the offer ends after this moment. */
  until: string;
}

const LAUNCH_OFFER_UNTIL = '2026-12-31T23:59:59+01:00';

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    summary: 'A first look at roles on career pages.',
    regularPrice: 5,
    offer: { price: 3, until: LAUNCH_OFFER_UNTIL },
    features: ['Browse roles from career pages', 'Save up to 5 jobs'],
  },
  {
    id: 'pro',
    name: 'Pro',
    summary: 'Everything you need to apply directly.',
    regularPrice: 29,
    offer: { price: 19, until: LAUNCH_OFFER_UNTIL },
    features: [
      'Unlimited roles and saved jobs',
      'Matches based on your profile',
      'Guides for applications and negotiations',
      'Community access',
    ],
    recommended: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    summary: 'Your job search with every extra.',
    regularPrice: 149,
    offer: { price: 99, until: LAUNCH_OFFER_UNTIL },
    features: [
      'Everything in Pro',
      'Priority alerts for new roles',
      'Early access to new features',
    ],
  },
];

export interface TierPrice {
  price: number;
  /** Set while an offer runs: the price that applies after it ends. */
  regularPrice: number | null;
  discountPercent: number | null;
  offerEnds: Date | null;
}

/** The price that applies at `now`, with offer details while one runs. */
export function currentPrice(tier: PricingTier, now = new Date()): TierPrice {
  const offerEnds = tier.offer ? new Date(tier.offer.until) : null;
  if (!tier.offer || !offerEnds || now > offerEnds) {
    return {
      price: tier.regularPrice,
      regularPrice: null,
      discountPercent: null,
      offerEnds: null,
    };
  }
  return {
    price: tier.offer.price,
    regularPrice: tier.regularPrice,
    discountPercent: Math.round(
      (1 - tier.offer.price / tier.regularPrice) * 100,
    ),
    offerEnds,
  };
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatOfferEnd(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'long',
    timeZone: 'Europe/Berlin',
  }).format(date);
}
