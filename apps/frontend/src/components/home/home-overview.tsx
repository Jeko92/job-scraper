import type { AuthUser } from '@job-scraper/shared';

import { getLatestJobs, getSavedJobs, getUserStats } from '@/lib/home/data';
import { getProfile } from '@/lib/profile/profile';

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

export async function HomeOverview({ user }: HomeOverviewProps) {
  const [profile, stats, latestJobs, savedJobs] = await Promise.all([
    getProfile(),
    getUserStats(),
    getLatestJobs(),
    getSavedJobs(),
  ]);

  return (
    <main className="flex flex-1 flex-col gap-2 px-4 pb-8 sm:px-8">
      <section className="flex flex-wrap gap-2">
        <WelcomeSection
          firstName={profile?.firstName ?? user.username}
          stats={stats}
          hasFields={(profile?.industries.length ?? 0) > 0}
          className="flex-[2_1_34rem]"
        />
        {stats && (
          <WeekSummaryTile stats={stats} className="flex-[1_1_20rem]" />
        )}
      </section>
      <LatestJobsSection jobs={latestJobs} />
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        <SavedJobsCard savedJobs={savedJobs} />
        <ProfileStrengthCard profile={profile} />
      </div>
      {stats && <MarketPulseSection stats={stats} profile={profile} />}
      <PromoTiles />
    </main>
  );
}
