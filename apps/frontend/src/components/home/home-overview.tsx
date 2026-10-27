import type { AuthUser } from '@job-scraper/shared';
import { Suspense } from 'react';

import { MARKET_PULSE_LINES, TileSkeleton } from './home-skeletons';
import { LatestJobsSection } from './latest-jobs-section';
import { MarketPulseSection } from './market-pulse-section';
import { ProfileStrengthCard } from './profile-strength-card';
import { PromoTiles } from './promo-tiles';
import { SavedJobsCard } from './saved-jobs-card';
import { WeekSummaryTile } from './week-summary-tile';
import { WelcomeSection } from './welcome-section';

const welcomeTile = 'flex-[2_1_34rem]';
const summaryTile = 'flex-[1_1_20rem]';

interface HomeOverviewProps {
  user: AuthUser;
}

export function HomeOverview({ user }: HomeOverviewProps) {
  return (
    <main className="flex flex-1 flex-col gap-2 px-4 pb-8 sm:px-8">
      <section className="flex flex-wrap gap-2">
        <Suspense fallback={<TileSkeleton className={welcomeTile} />}>
          <WelcomeSection user={user} className={welcomeTile} />
        </Suspense>
        <Suspense fallback={<TileSkeleton className={summaryTile} />}>
          <WeekSummaryTile className={summaryTile} />
        </Suspense>
      </section>
      <LatestJobsSection />
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        <Suspense fallback={<TileSkeleton />}>
          <SavedJobsCard />
        </Suspense>
        <Suspense fallback={<TileSkeleton />}>
          <ProfileStrengthCard />
        </Suspense>
      </div>
      <Suspense fallback={<TileSkeleton lines={MARKET_PULSE_LINES} />}>
        <MarketPulseSection />
      </Suspense>
      <PromoTiles />
    </main>
  );
}
