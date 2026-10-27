import type { UserStats } from '@job-scraper/shared';

import { getUserStats } from '@/lib/home/data';
import { formatJobCount } from '@/lib/jobs/format';
import { overline } from '@/lib/styles';
import { cn } from '@/lib/utils';

import { LoadError } from './load-error';

function summaryItems(stats: UserStats) {
  const period = `last ${String(stats.periodDays)} days`;
  return [
    { value: stats.newJobs, label: `new roles, ${period}` },
    { value: stats.activeJobs, label: 'open roles' },
    { value: stats.hiringCompanies, label: 'companies hiring' },
    { value: stats.newCompanies, label: `new career pages, ${period}` },
  ];
}

interface WeekSummaryTileProps {
  className?: string;
}

export async function WeekSummaryTile({ className }: WeekSummaryTileProps) {
  const stats = await getUserStats();
  const items = stats && summaryItems(stats);

  return (
    <section
      aria-labelledby="at-a-glance"
      className={cn(
        'flex flex-col gap-6 rounded-tile border border-transparent bg-[color-mix(in_oklch,var(--highlight)_12%,var(--surface))] p-8 text-ink shadow-[inset_0_14px_18px_-8px_color-mix(in_oklch,var(--navy)_60%,transparent)] dark:shadow-[inset_0_14px_18px_-8px_color-mix(in_oklch,black_65%,transparent)]',
        className,
      )}
    >
      <h2 id="at-a-glance" className={overline}>
        At a glance
      </h2>
      {items ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-6">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex flex-col-reverse justify-end gap-0.5"
            >
              <dt className="text-sm text-ink-muted">{item.label}</dt>
              <dd className="font-heading text-[2.75rem] leading-12 tracking-tight">
                {formatJobCount(item.value)}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <LoadError subject="Statistics" />
      )}
    </section>
  );
}
