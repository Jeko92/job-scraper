import type { UserProfile } from '@job-scraper/shared';
import { Check, Circle } from 'lucide-react';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { getCompleteness, getProfileChecks } from '@/lib/profile/completeness';
import { PROFILE_HREF } from '@/lib/routes';
import { cn } from '@/lib/utils';

import { HomeCard } from './home-card';
import { MatchRing } from './match-ring';

const TITLE = 'Better profile, better matches';

interface ProfileStrengthCardProps {
  profile: UserProfile | null;
}

export function ProfileStrengthCard({ profile }: ProfileStrengthCardProps) {
  if (profile === null) {
    return (
      <HomeCard title={TITLE}>
        <p className="text-sm text-ink-muted">
          Your profile could not be loaded right now. Please try again later.
        </p>
      </HomeCard>
    );
  }

  const checks = getProfileChecks(profile);
  const completeness = getCompleteness(checks);
  const nextStep = checks.find((check) => !check.done);

  return (
    <HomeCard title={TITLE}>
      <div className="flex items-center gap-4">
        <MatchRing
          value={completeness}
          label={`Profile ${String(completeness)}% complete`}
          tone="highlight"
          className="size-18"
        />
        <p className="text-sm text-ink-muted">
          {nextStep ? (
            <>
              Add your{' '}
              <span className="text-ink">{nextStep.label.toLowerCase()}</span>{' '}
              to get better matches.
            </>
          ) : (
            'Your profile is complete. Your matches use all of it.'
          )}
        </p>
      </div>

      <ul className="my-5 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
        {checks.map((check) => (
          <li
            key={check.label}
            className={cn(
              'flex items-center gap-2.5',
              check.done ? 'text-ink' : 'text-ink-muted',
            )}
          >
            {check.done ? (
              <Check
                className="size-4.5"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            ) : (
              <Circle className="size-4.5" aria-hidden="true" />
            )}
            {check.label}
            <span className="sr-only">
              {check.done ? ', done' : ', missing'}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={PROFILE_HREF}
        className={cn(
          buttonVariants(nextStep ? undefined : { variant: 'outline' }),
          'mt-auto h-11 self-start rounded-pill px-5 font-semibold',
        )}
      >
        {nextStep ? 'Complete profile' : 'Edit profile'}
      </Link>
    </HomeCard>
  );
}
