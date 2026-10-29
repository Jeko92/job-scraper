import type { Location, UserProfile } from '@job-scraper/shared';
import { describe, expect, it } from 'vitest';

import { buildMatchCriteria, type ScorableJob, scoreJob } from './job-match.js';

const berlin: Location = {
  id: 'berlin',
  countryCode: 'DE',
  countryName: 'Germany',
  stateName: 'Berlin',
  city: 'Berlin',
  postalCode: null,
};

const emptyProfile: UserProfile = {
  id: 'profile',
  firstName: null,
  lastName: null,
  headline: null,
  yearsExperience: null,
  seniority: null,
  location: null,
  preferencesLocations: [],
  skills: [],
  industries: [],
  preferences: null,
  onboardingCompleted: true,
  updatedAt: '2026-10-28T00:00:00.000Z',
};

/** The example user from the ADR-011 appendix. */
const profile: UserProfile = {
  ...emptyProfile,
  location: berlin,
  skills: ['react', 'typescript', 'nodejs', 'postgresql'].map((id) => ({
    id,
    name: id,
    slug: id,
    level: null,
    yearsExperience: null,
  })),
  preferences: {
    remotePreference: 'HYBRID',
    employmentType: 'FULL_TIME',
    minSalary: null,
    salaryCurrency: null,
    willingToRelocate: false,
  },
};

function job(fields: Partial<ScorableJob> = {}): ScorableJob {
  return {
    workplaceType: 'HYBRID',
    employmentType: 'FULL_TIME',
    locationId: 'berlin',
    skills: ['react', 'typescript', 'nodejs', 'postgresql'].map((skillId) => ({
      skillId,
      required: true,
    })),
    ...fields,
  };
}

/** Example 1: React, TypeScript, Node.js, Docker, AWS. */
const threeOfFiveSkills = [
  'react',
  'typescript',
  'nodejs',
  'docker',
  'aws',
].map((skillId) => ({ skillId, required: true }));

describe('scoreJob', () => {
  it('has no match when no rule can be compared', () => {
    expect(scoreJob(buildMatchCriteria(emptyProfile), job())).toBeNull();
  });

  it('gives 100 when every rule fits', () => {
    expect(scoreJob(buildMatchCriteria(profile), job())).toBe(100);
  });

  it('weights the rules (ADR-011 example 1: 64 %)', () => {
    const munichJob = job({ skills: threeOfFiveSkills, locationId: 'munich' });
    expect(scoreJob(buildMatchCriteria(profile), munichJob)).toBe(64);
  });

  it('skips rules the job has no value for (ADR-011 example 3: 73 %)', () => {
    const sparseJob = job({
      skills: threeOfFiveSkills,
      workplaceType: null,
      locationId: null,
    });
    expect(scoreJob(buildMatchCriteria(profile), sparseJob)).toBe(73);
  });
});
