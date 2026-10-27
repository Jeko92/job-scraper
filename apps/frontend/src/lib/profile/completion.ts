import type { UserProfile } from '@job-scraper/shared';

export interface ProfileCompletion {
  /** 0–100, rounded. */
  percent: number;
  /** The first field still empty, e.g. "seniority"; null when complete. */
  nextMissing: string | null;
}

// One check per editable row, in page order. "Places" is left out: it only
// applies when the user is open to relocating.
const CHECKS: { name: string; isFilled: (profile: UserProfile) => boolean }[] =
  [
    { name: 'name', isFilled: (p) => Boolean(p.firstName && p.lastName) },
    { name: 'role', isFilled: (p) => Boolean(p.headline) },
    { name: 'seniority', isFilled: (p) => p.seniority !== null },
    { name: 'experience', isFilled: (p) => p.yearsExperience !== null },
    { name: 'location', isFilled: (p) => p.location !== null },
    {
      name: 'employment type',
      isFilled: (p) => Boolean(p.preferences?.employmentType),
    },
    {
      name: 'work setup',
      isFilled: (p) => Boolean(p.preferences?.remotePreference),
    },
    { name: 'skills', isFilled: (p) => p.skills.length > 0 },
    { name: 'industries', isFilled: (p) => p.industries.length > 0 },
  ];

export function getProfileCompletion(profile: UserProfile): ProfileCompletion {
  const missing = CHECKS.filter((check) => !check.isFilled(profile));
  return {
    percent: Math.round(
      ((CHECKS.length - missing.length) / CHECKS.length) * 100,
    ),
    nextMissing: missing[0]?.name ?? null,
  };
}
