import type { UserProfile } from '@job-scraper/shared';

import { toLocationOption } from '@/lib/lookups/options';
import { getProfileCompletion } from '@/lib/profile/completion';

import { CompletionRing } from './common/completion-ring';
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
  const completion = getProfileCompletion(profile);

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
          <CompletionRing percent={completion.percent} />
          <div className="space-y-1">
            <p className="text-lg font-medium text-ink">
              Profile {completion.percent}% complete
            </p>
            <p className="text-sm text-ink-muted">
              {completion.nextMissing
                ? `Add your ${completion.nextMissing} to improve your matches.`
                : 'Your profile is complete.'}
            </p>
          </div>
        </div>
      </div>
    </ProfileTile>
  );
}
