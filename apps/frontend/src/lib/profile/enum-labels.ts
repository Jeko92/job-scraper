import type {
  EmploymentType,
  RemotePreference,
  SeniorityLevel,
} from '@job-scraper/shared';

// Display text for the shared profile enums (onboarding and profile page).
//TODO: Refactor making it centralized and use it also in job search rather than formate lib/jobs/formart

export const SENIORITY_LABELS: Record<SeniorityLevel, string> = {
  INTERN: 'Intern',
  JUNIOR: 'Junior',
  MID: 'Mid',
  SENIOR: 'Senior',
  LEAD: 'Lead',
};

export const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
};

export const WORK_SETUP_LABELS: Record<RemotePreference, string> = {
  ONSITE: 'On-site',
  HYBRID: 'Hybrid',
  REMOTE: 'Remote',
};
