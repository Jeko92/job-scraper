import type { UserProfile } from '@job-scraper/shared';

import { MatchRing } from '@/components/common/match-ring';
import { toLocationOption } from '@/lib/lookups/options';
import { getCompleteness, getProfileChecks } from '@/lib/profile/completeness';

import { ProfileTile } from './common/profile-tile';

interface ProfileSummaryProps {
  profile: UserProfile;
}

export function ProfileSummary({ profile }: ProfileSummaryProps) {
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
  const initials = [profile.firstName, profile.lastName]
    .map((part) => part?.charAt(0) ?? '')
    .join('')
    .toUpperCase();
  const subtitle = [
    profile.headline,
    profile.location && toLocationOption(profile.location).label,
  ]
    .filter(Boolean)
    .join(' · ');
  const checks = getProfileChecks(profile);
  const completeness = getCompleteness(checks);
  const nextStep = checks.find((check) => !check.done);

  return (
    <ProfileTile title="Your profile">
      <div className="space-y-4">
        <div
          aria-hidden="true"
          className="flex size-24 items-center justify-center rounded-full bg-highlight text-3xl font-semibold text-on-highlight"
        >
          {initials}
        </div>
        <div className="space-y-1">
          <p className="font-heading text-3xl leading-tight break-words text-ink">
            {name}
          </p>
          {subtitle && <p className="text-ink-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4 pt-2">
          <MatchRing
            value={completeness}
            label={`Profile ${String(completeness)}% complete`}
          />
          <div className="space-y-1">
            <p className="text-lg font-medium text-ink">
              Profile {completeness}% complete
            </p>
            <p className="text-sm text-ink-muted">
              {nextStep
                ? `Add your ${nextStep.label.toLowerCase()} to improve your matches.`
                : 'Your profile is complete.'}
            </p>
          </div>
        </div>
      </div>
    </ProfileTile>
  );
}
