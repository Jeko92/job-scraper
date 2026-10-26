import type { AuthUser } from '@job-scraper/shared';

import { getProfile } from '@/lib/profile/profile';

import { WelcomeSection } from './welcome-section';

interface HomeOverviewProps {
  user: AuthUser;
}

export async function HomeOverview({ user }: HomeOverviewProps) {
  const profile = await getProfile();

  return (
    <main className="flex flex-1 flex-col gap-2 px-4 pb-8 sm:px-8">
      <section className="flex flex-wrap gap-2">
        <WelcomeSection
          firstName={profile?.firstName ?? user.username}
          className="flex-[2_1_34rem]"
        />
      </section>
    </main>
  );
}
