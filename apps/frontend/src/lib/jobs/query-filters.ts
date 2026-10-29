import { type JobsQuery, MAX_FILTER_VALUES } from '@job-scraper/shared';

/** The filters of a job search that hold a list of values. */
export const LIST_FILTER_KEYS = [
  'workplaceType',
  'employmentType',
  'locationId',
  'skill',
] as const satisfies readonly (keyof JobsQuery)[];

export type ListFilterKey = (typeof LIST_FILTER_KEYS)[number];
type FilterValue<K extends ListFilterKey> = NonNullable<JobsQuery[K]>[number];

function valuesOf<K extends ListFilterKey>(
  query: JobsQuery,
  key: K,
): FilterValue<K>[] {
  return query[key] ?? [];
}

/** Appends the value, unless it is already there or the list is full. */
export function addFilterValue<K extends ListFilterKey>(
  query: JobsQuery,
  key: K,
  value: FilterValue<K>,
): JobsQuery {
  const values = valuesOf(query, key);
  if (values.includes(value) || values.length >= MAX_FILTER_VALUES) {
    return query;
  }
  return { ...query, [key]: [...values, value] };
}

/** Removes the value; removing the last one drops the filter from the URL. */
export function removeFilterValue<K extends ListFilterKey>(
  query: JobsQuery,
  key: K,
  value: FilterValue<K>,
): JobsQuery {
  const values = valuesOf(query, key).filter((item) => item !== value);
  return { ...query, [key]: values.length > 0 ? values : undefined };
}

export function toggleFilterValue<K extends ListFilterKey>(
  query: JobsQuery,
  key: K,
  value: FilterValue<K>,
): JobsQuery {
  return valuesOf(query, key).includes(value)
    ? removeFilterValue(query, key, value)
    : addFilterValue(query, key, value);
}
