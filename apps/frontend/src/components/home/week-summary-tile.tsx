import type { UserStats } from '@job-scraper/shared';

import { formatJobCount } from '@/lib/jobs/format';
import { overline } from '@/lib/styles';
import { cn } from '@/lib/utils';

interface WeekSummaryTileProps {
  stats: UserStats;
  className?: string;
}

export function WeekSummaryTile({ stats, className }: WeekSummaryTileProps) {
  const period = `last ${String(stats.periodDays)} days`;
  const items = [
    { value: stats.newJobs, label: `new roles, ${period}` },
    { value: stats.activeJobs, label: 'open roles' },
    { value: stats.hiringCompanies, label: 'companies hiring' },
    { value: stats.newCompanies, label: `new career pages, ${period}` },
  ];

  return (
    <section
      aria-labelledby="at-a-glance"
      className={cn(
        'flex flex-col gap-6 rounded-tile border border-transparent bg-highlight p-8 text-on-highlight shadow-[inset_0_14px_24px_color-mix(in_oklch,var(--highlight),var(--navy)_45%),inset_0_-10px_20px_color-mix(in_oklch,var(--highlight),white_55%)]',
        className,
      )}
    >
      <h2 id="at-a-glance" className={overline}>
        At a glance
      </h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-6">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col-reverse justify-end gap-0.5"
          >
            <dt className="text-sm">{item.label}</dt>
            <dd className="font-heading text-[2.75rem] leading-12 tracking-tight">
              {formatJobCount(item.value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
