import type {
  EmploymentType,
  JobListItem,
  JobSort,
  RemotePreference,
} from '@job-scraper/shared';

export const WORKPLACE_TYPE_LABELS: Record<RemotePreference, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'On-site',
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
};

export const JOB_SORT_LABELS: Record<JobSort, string> = {
  newest: 'Newest',
  oldest: 'Oldest',
};

export const POSTED_WITHIN_OPTIONS = [1, 7, 30] as const;

const MAX_CARD_SKILLS = 4;
const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;

export function formatPostedWithin(days: number): string {
  return days === 1 ? 'Last 24 hours' : `Last ${String(days)} days`;
}

export function formatJobCount(count: number): string {
  return new Intl.NumberFormat('en').format(count);
}

/** "2 minutes ago", "Yesterday", or a date for older jobs. */
export function formatPostedAt(iso: string, now: number = Date.now()): string {
  const date = new Date(iso);
  const seconds = Math.round((date.getTime() - now) / 1000);
  const elapsed = Math.abs(seconds);
  const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  let text: string;
  if (elapsed < MINUTE) {
    text = 'just now';
  } else if (elapsed < HOUR) {
    text = relative.format(Math.round(seconds / MINUTE), 'minute');
  } else if (elapsed < DAY) {
    text = relative.format(Math.round(seconds / HOUR), 'hour');
  } else if (elapsed < MONTH) {
    text = relative.format(Math.round(seconds / DAY), 'day');
  } else {
    text = new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date);
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "Company · City · Work mode · Contract" */
export function formatJobMeta(job: JobListItem): string {
  return [
    job.company.name ?? job.company.domain,
    job.location?.city ?? job.location?.countryName,
    job.workplaceType && WORKPLACE_TYPE_LABELS[job.workplaceType],
    job.employmentType && EMPLOYMENT_TYPE_LABELS[job.employmentType],
  ]
    .filter((part) => part !== null && part !== undefined && part !== '')
    .join(' · ');
}

export function formatJobSkills(job: JobListItem): string {
  return job.skills
    .slice(0, MAX_CARD_SKILLS)
    .map((skill) => skill.name)
    .join(' · ');
}

export function formatJobSalary(job: JobListItem): string | null {
  const currency = job.salaryCurrency ?? 'EUR';
  const { salaryMin, salaryMax } = job;
  if (salaryMin !== null && salaryMax !== null) {
    return `${formatMoney(salaryMin, currency)} – ${formatMoney(salaryMax, currency)}`;
  }
  if (salaryMin !== null) {
    return `From ${formatMoney(salaryMin, currency)}`;
  }
  if (salaryMax !== null) {
    return `Up to ${formatMoney(salaryMax, currency)}`;
  }
  return null;
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Unknown currency code from the source.
    return `${new Intl.NumberFormat('en').format(amount)} ${currency}`;
  }
}
