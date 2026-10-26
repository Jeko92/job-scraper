export const POSTED_AT = 'COALESCE(job.publishedAt, job.firstSeenAt)';

export function withinDays(column: string, daysParameter: string): string {
  return `${column} >= NOW() - make_interval(days => :${daysParameter})`;
}
