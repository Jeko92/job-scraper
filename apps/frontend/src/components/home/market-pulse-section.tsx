import type { UserProfile, UserStats } from '@job-scraper/shared';
import { Check } from 'lucide-react';
import Link from 'next/link';

import { formatCompanyName, formatJobCount } from '@/lib/jobs/format';
import { PROFILE_HREF } from '@/lib/routes';
import { overline } from '@/lib/styles';
import { cn } from '@/lib/utils';

const INITIALS_LENGTH = 2;

function initials(name: string): string {
  return name
    .split(/[\s.]+/)
    .filter((word) => word !== '')
    .slice(0, INITIALS_LENGTH)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

interface MarketPulseSectionProps {
  stats: UserStats;
  profile: UserProfile | null;
}

export function MarketPulseSection({
  stats,
  profile,
}: MarketPulseSectionProps) {
  const fields = profile?.industries.map((industry) => industry.name) ?? [];
  const profileSkills = new Set(profile?.skills.map((skill) => skill.slug));
  const skills = stats.topSkills.map((skill) => ({
    ...skill,
    yours: profileSkills.has(skill.slug),
  }));
  const missingSkill =
    profile === null ? undefined : skills.find((skill) => !skill.yours);

  return (
    <section
      aria-labelledby="market-pulse"
      className="flex flex-col gap-6 rounded-tile border border-line bg-surface p-6 sm:p-8"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="market-pulse"
          className="font-heading text-[2rem] leading-[2.375rem] tracking-tight text-ink"
        >
          {fields.length > 0 ? 'Market pulse in your fields' : 'Market pulse'}
        </h2>
        <p className="text-sm text-ink-muted">
          {fields.length > 0 ? fields.join(', ') : 'All fields'} ·{' '}
          {formatJobCount(stats.activeJobs)} open roles
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-3.5">
          <h3 className={cn(overline, 'text-ink-muted')}>
            Most asked-for skills
          </h3>
          {skills.length > 0 ? (
            <ul className="flex flex-col gap-3.5">
              {skills.map((skill) => (
                <li
                  key={skill.id}
                  className="grid grid-cols-[7rem_minmax(0,1fr)_3rem] items-center gap-3 text-sm"
                >
                  <span className="inline-flex min-w-0 items-center gap-1.5 text-ink">
                    <span className="truncate">{skill.name}</span>
                    {skill.yours && (
                      <>
                        <Check
                          className="size-3.5 shrink-0"
                          strokeWidth={3}
                          aria-hidden="true"
                        />
                        <span className="sr-only">, in your profile</span>
                      </>
                    )}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-2.5 overflow-hidden rounded-pill bg-line"
                  >
                    <span
                      className={cn(
                        'block h-full rounded-pill',
                        skill.yours ? 'bg-ink' : 'bg-highlight',
                      )}
                      style={{ width: `${String(skill.share)}%` }}
                    />
                  </span>
                  <span className="text-right text-ink-muted">
                    {skill.share}%
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">
              No skill data yet. It shows up once crawled jobs list their
              skills.
            </p>
          )}
          {missingSkill && (
            <p className="text-[13px] leading-[18px] text-ink-muted">
              {missingSkill.name} is in {missingSkill.share}% of roles and not
              in your profile yet.{' '}
              <Link
                href={PROFILE_HREF}
                className="rounded-sm font-semibold text-ink underline-offset-4 outline-none hover:underline focus-visible:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Add {missingSkill.name} to your profile
              </Link>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3.5">
          <h3 className={cn(overline, 'text-ink-muted')}>
            Companies hiring most
          </h3>
          {stats.topCompanies.length > 0 ? (
            <ol>
              {stats.topCompanies.map((company) => {
                const name =
                  formatCompanyName({ company }) ?? 'Unknown company';
                return (
                  <li
                    key={company.id}
                    className="flex items-center gap-3.5 border-b border-line py-2.5"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-9 shrink-0 items-center justify-center rounded-chip border border-line bg-bg text-[13px] font-semibold text-ink"
                    >
                      {initials(name)}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[15px] leading-5 text-ink">
                        {name}
                      </span>
                      {company.name !== null && company.domain !== null && (
                        <span className="truncate text-[13px] leading-[18px] text-ink-muted">
                          {company.domain}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-[13px] font-semibold text-ink">
                      {formatJobCount(company.openJobs)}{' '}
                      {company.openJobs === 1 ? 'role' : 'roles'}
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="text-sm text-ink-muted">No open roles yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
