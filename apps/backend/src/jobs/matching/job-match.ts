import type { RemotePreference, UserProfile } from '@job-scraper/shared';

/** How much each rule counts towards the match (ADR-011). Sums to 100. */
export const MATCH_WEIGHTS = {
  skills: 40,
  workplace: 20,
  employment: 20,
  location: 20,
} as const;

/** Job workplace types a user with this preference accepts. */
const ACCEPTED_WORKPLACES: Record<RemotePreference, readonly string[]> = {
  REMOTE: ['REMOTE'],
  HYBRID: ['HYBRID', 'REMOTE'],
  ONSITE: ['ONSITE', 'HYBRID'],
};

/** What a job is compared with, taken from one user's profile. */
export interface MatchCriteria {
  skillIds: ReadonlySet<string>;
  /** Null when the user has no remote preference. */
  workplaceTypes: readonly string[] | null;
  employmentType: string | null;
  /** Preferred locations, or the home location when there are none. */
  locationIds: ReadonlySet<string>;
  willingToRelocate: boolean;
}

/** The job fields the match needs. */
export interface ScorableJob {
  workplaceType: string | null;
  employmentType: string | null;
  locationId: string | null;
  skills: { skillId: string; required: boolean }[];
}

export function buildMatchCriteria(profile: UserProfile): MatchCriteria {
  const { preferences } = profile;
  const locations =
    profile.preferencesLocations.length > 0
      ? profile.preferencesLocations
      : profile.location
        ? [profile.location]
        : [];
  return {
    skillIds: new Set(profile.skills.map((skill) => skill.id)),
    workplaceTypes: preferences?.remotePreference
      ? ACCEPTED_WORKPLACES[preferences.remotePreference]
      : null,
    employmentType: preferences?.employmentType ?? null,
    locationIds: new Set(locations.map((location) => location.id)),
    willingToRelocate: preferences?.willingToRelocate ?? false,
  };
}

/**
 * Match from 0 to 100. A rule only counts when both the profile and the job
 * have a value for it; null when no rule counts.
 */
export function scoreJob(
  criteria: MatchCriteria,
  job: ScorableJob,
): number | null {
  let points = 0;
  let countedWeight = 0;
  function count(weight: number, score: number) {
    points += weight * score;
    countedWeight += weight;
  }

  if (criteria.skillIds.size > 0 && job.skills.length > 0) {
    const required = job.skills.filter((skill) => skill.required);
    // Nice-to-have skills only count when the job requires none.
    const counted = required.length > 0 ? required : job.skills;
    const shared = counted.filter((skill) =>
      criteria.skillIds.has(skill.skillId),
    ).length;
    count(MATCH_WEIGHTS.skills, shared / counted.length);
  }
  if (criteria.workplaceTypes && job.workplaceType) {
    count(
      MATCH_WEIGHTS.workplace,
      criteria.workplaceTypes.includes(job.workplaceType) ? 1 : 0,
    );
  }
  if (criteria.employmentType && job.employmentType) {
    count(
      MATCH_WEIGHTS.employment,
      criteria.employmentType === job.employmentType ? 1 : 0,
    );
  }
  if (criteria.locationIds.size > 0 && job.locationId) {
    const fits =
      criteria.willingToRelocate ||
      job.workplaceType === 'REMOTE' ||
      criteria.locationIds.has(job.locationId);
    count(MATCH_WEIGHTS.location, fits ? 1 : 0);
  }

  return countedWeight === 0
    ? null
    : Math.round((100 * points) / countedWeight);
}
