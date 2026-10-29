import type {
  EmploymentType,
  RemotePreference,
  SeniorityLevel,
} from '@job-scraper/shared';

// Display text for the shared enums (onboarding, profile page and job search).

export const SENIORITY_LABELS: Record<SeniorityLevel, string> = {
  INTERN: 'Intern',
  JUNIOR: 'Junior',
  MID: 'Mid',
  SENIOR: 'Senior',
  LEAD: 'Lead',
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
};

export const REMOTE_PREFERENCE_LABELS: Record<RemotePreference, string> = {
  ONSITE: 'On-site',
  HYBRID: 'Hybrid',
  REMOTE: 'Remote',
};
