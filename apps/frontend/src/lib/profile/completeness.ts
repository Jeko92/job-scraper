import type { UserProfile } from '@job-scraper/shared';

const PERCENT = 100;

export type ProfileSectionKey =
  'basic-info' | 'skills' | 'industries' | 'job-preferences';

export interface ProfileCheck {
  section: ProfileSectionKey;
  label: string;
  done: boolean;
}

export function getProfileChecks(profile: UserProfile): ProfileCheck[] {
  const preferences = profile.preferences;
  return [
    {
      section: 'basic-info',
      label: 'Headline',
      done: profile.headline !== null,
    },
    {
      section: 'basic-info',
      label: 'Experience',
      done: profile.yearsExperience !== null || profile.seniority !== null,
    },
    {
      section: 'basic-info',
      label: 'Location',
      done: profile.location !== null,
    },
    {
      section: 'skills',
      label: 'Skills',
      done: profile.skills.length > 0,
    },
    {
      section: 'industries',
      label: 'Industries',
      done: profile.industries.length > 0,
    },
    {
      section: 'job-preferences',
      label: 'Work setup',
      done: (preferences?.remotePreference ?? null) !== null,
    },
    {
      section: 'job-preferences',
      label: 'Employment type',
      done: (preferences?.employmentType ?? null) !== null,
    },
  ];
}

export function getCompleteness(checks: ProfileCheck[]): number {
  const done = checks.filter((check) => check.done).length;
  return Math.round((done / checks.length) * PERCENT);
}
