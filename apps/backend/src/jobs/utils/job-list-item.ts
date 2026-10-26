import {
  EMPLOYMENT_TYPES,
  type JobDetail,
  type JobListItem,
  REMOTE_PREFERENCES,
} from '@job-scraper/shared';

import { toLocationDto } from '../../locations/locations.service.js';
import type { Job } from '../entities/job.entity.js';

export function toJobListItem(
  job: Job,
  isSaved: boolean,
): JobListItem & Pick<JobDetail, 'sourceUrl'> {
  const company = job.company;
  if (!company) {
    throw new Error(`Job "${job.id}" was loaded without its company`);
  }
  return {
    id: job.id,
    title: job.title,
    sourceUrl: job.sourceUrl,
    company: { id: company.id, name: company.name, domain: company.domain },
    location: job.location ? toLocationDto(job.location) : null,
    workplaceType: oneOf(REMOTE_PREFERENCES, job.workplaceType),
    employmentType: oneOf(EMPLOYMENT_TYPES, job.employmentType),
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    postedAt: (job.publishedAt ?? job.firstSeenAt).toISOString(),
    skills: (job.skills ?? []).flatMap(({ skill, required }) =>
      skill
        ? [{ id: skill.id, name: skill.name, slug: skill.slug, required }]
        : [],
    ),
    isSaved,
  };
}

export type DefinedOnly<T> = { [K in keyof T]?: Exclude<T[K], undefined> };

export function definedOnly<T extends object>(value: T): DefinedOnly<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as DefinedOnly<T>;
}

export function toDate(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null;
}

export function oneOf<T extends string>(
  values: readonly T[],
  value: string | null,
): T | null {
  return values.find((allowed) => allowed === value) ?? null;
}
