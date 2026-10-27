import type { UserProfile } from '@job-scraper/shared';

const PERCENT = 100;

export interface ProfileCheck {
  label: string;
  done: boolean;
}

export function getProfileChecks(profile: UserProfile): ProfileCheck[] {
  const preferences = profile.preferences;
  return [
    {
      label: 'Headline',
      done: (profile.headline?.trim() ?? '') !== '',
    },
    {
      label: 'Experience',
      done: profile.yearsExperience !== null || profile.seniority !== null,
    },
    {
      label: 'Location',
      done: profile.location !== null,
    },
    {
      label: 'Skills',
      done: profile.skills.length > 0,
    },
    {
      label: 'Industries',
      done: profile.industries.length > 0,
    },
    {
      label: 'Work setup',
      done: (preferences?.remotePreference ?? null) !== null,
    },
    {
      label: 'Employment type',
      done: (preferences?.employmentType ?? null) !== null,
    },
  ];
}

export function getCompleteness(checks: ProfileCheck[]): number {
  const done = checks.filter((check) => check.done).length;
  return Math.round((done / checks.length) * PERCENT);
}
