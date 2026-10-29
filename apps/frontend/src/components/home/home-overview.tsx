import type { AuthUser } from '@job-scraper/shared';
import { Suspense } from 'react';

import {
  cardsRow,
  homeMain,
  summaryTile,
  welcomeRow,
  welcomeTile,
} from './home-layout';
import {
  CardsRowSkeleton,
  MarketPulseSkeleton,
  WelcomeRowSkeleton,
} from './home-skeletons';
import { LatestJobsSection } from './latest-jobs-section';
import { MarketPulseSection } from './market-pulse-section';
import { ProfileStrengthCard } from './profile-strength-card';
import { PromoTiles } from './promo-tiles';
import { SavedJobsCard } from './saved-jobs-card';
import { WeekSummaryTile } from './week-summary-tile';
import { WelcomeSection } from './welcome-section';

interface HomeOverviewProps {
  user: AuthUser;
}

export function HomeOverview({ user }: HomeOverviewProps) {
  return (
    <main className={homeMain}>
      <Suspense fallback={<WelcomeRowSkeleton />}>
        <section className={welcomeRow}>
          <WelcomeSection user={user} className={welcomeTile} />
          <WeekSummaryTile className={summaryTile} />
        </section>
      </Suspense>
      <LatestJobsSection />
      <Suspense fallback={<CardsRowSkeleton />}>
        <div className={cardsRow}>
          <SavedJobsCard />
          <ProfileStrengthCard />
        </div>
      </Suspense>
      <Suspense fallback={<MarketPulseSkeleton />}>
        <MarketPulseSection />
      </Suspense>
      <PromoTiles />
    </main>
  );
}
