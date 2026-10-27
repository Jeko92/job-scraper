import type { AuthUser } from '@job-scraper/shared';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { GlowPanel } from '@/components/landing/glow-panel';
import { SectionChip } from '@/components/landing/section-chip';
import { buttonVariants } from '@/components/ui/button';
import { getUserStats } from '@/lib/home/data';
import { formatJobCount } from '@/lib/jobs/format';
import { getProfile } from '@/lib/profile/profile';
import { PROFILE_HREF, SEARCH_HREF } from '@/lib/routes';
import { cn } from '@/lib/utils';

import { LineSkeleton } from './home-skeletons';

const pill = 'h-11 rounded-pill px-5 text-[0.95rem] font-semibold';

async function WelcomeStats() {
  const stats = await getUserStats();
  if (!stats) {
    return null;
  }

  return (
    <p className="max-w-2xl text-ink-muted">
      <span className="text-ink">
        {formatJobCount(stats.newJobs)} new{' '}
        {stats.newJobs === 1 ? 'role' : 'roles'}
      </span>{' '}
      {stats.fields.length > 0 ? 'in your fields' : 'posted'} in the last{' '}
      {stats.periodDays} days.
    </p>
  );
}

interface WelcomeSectionProps {
  user: AuthUser;
  className?: string;
}

export async function WelcomeSection({ user, className }: WelcomeSectionProps) {
  const profile = await getProfile();

  return (
    <GlowPanel
      className={cn(
        'flex flex-col gap-5 rounded-tile border border-line bg-surface p-8 lg:px-12 lg:py-10',
        className,
      )}
    >
      <SectionChip className="self-start">Your overview</SectionChip>

      <h1 className="font-heading text-[2.5rem] leading-[1.1] font-normal text-ink sm:text-[3.25rem]">
        Welcome back, {profile?.firstName ?? user.username}.
      </h1>

      <Suspense fallback={<LineSkeleton className="h-6 w-80 max-w-full" />}>
        <WelcomeStats />
      </Suspense>

      <div className="mt-auto flex flex-wrap gap-3">
        <Link href={SEARCH_HREF} className={cn(buttonVariants(), pill)}>
          Search jobs
          <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
        </Link>
        <Link
          href={PROFILE_HREF}
          className={cn(buttonVariants({ variant: 'outline' }), pill)}
        >
          Edit profile
        </Link>
      </div>
    </GlowPanel>
  );
}
