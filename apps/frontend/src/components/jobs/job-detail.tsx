import type { JobDetail as JobDetailData, JobSkill } from '@job-scraper/shared';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { GlowPanel } from '@/components/landing/glow-panel';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCompanyName, formatPostedAt, jobFacts } from '@/lib/jobs/format';
import { overline } from '@/lib/styles';
import { cn } from '@/lib/utils';

import { BackToSearchLink } from './back-to-search-link';

// Shown until the backend sends descriptions (#39).
const DESCRIPTION_PLACEHOLDER = [
  'Leverage agile frameworks to provide a robust synopsis for high level overviews. Iterative approaches to corporate strategy foster collaborative thinking to further the overall value proposition.',
  'Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution.',
  'Capitalize on low hanging fruit to identify a ballpark value added activity to beta test. Override the digital divide with additional clickthroughs from DevOps.',
].join('\n\n');

const newTabHint = <span className="sr-only"> (opens in a new tab)</span>;

interface JobDetailProps {
  job: JobDetailData;
}

export function JobDetail({ job }: JobDetailProps) {
  const required = job.skills.filter((skill) => skill.required);
  const niceToHave = job.skills.filter((skill) => !skill.required);
  const companyName = formatCompanyName(job);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <BackToSearchLink />

      <GlowPanel className="flex flex-col gap-6 rounded-tile border border-line bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-4xl text-ink">{job.title}</h1>
          <JobFacts job={job} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-muted">
            Posted{' '}
            {/* Relative time differs between server and browser by a few seconds. */}
            <time dateTime={job.postedAt} suppressHydrationWarning>
              {formatPostedAt(job.postedAt)}
            </time>
          </p>
          <a
            href={job.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'ml-auto rounded-pill px-4 font-semibold',
            )}
          >
            View original posting
            {newTabHint}
            <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
          </a>
        </div>
      </GlowPanel>

      <Card className="gap-0 rounded-card px-6 py-0 ring-line">
        {job.skills.length > 0 && (
          <DetailSection id="job-skills" title="Skills">
            <SkillGroup
              id="job-skills-required"
              label="Required"
              skills={required}
            />
            <SkillGroup
              id="job-skills-nice-to-have"
              label="Nice to have"
              skills={niceToHave}
            />
          </DetailSection>
        )}

        <DetailSection id="job-about" title="About the role">
          {/* Plain text for now; HTML descriptions need a sanitising parser. */}
          {job.description === null && (
            <p className="text-sm text-ink-muted">
              Placeholder text. The full description will follow.
            </p>
          )}
          <p className="text-sm leading-6 whitespace-pre-line text-ink">
            {job.description ?? DESCRIPTION_PLACEHOLDER}
          </p>
        </DetailSection>

        {companyName && (
          <DetailSection id="job-company" title="Company">
            <div className="flex flex-col gap-1">
              <p className="text-ink">{companyName}</p>
              {job.company.domain && (
                <a
                  href={`https://${job.company.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit rounded-sm text-sm text-ink-muted underline-offset-4 outline-none hover:underline focus-visible:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {job.company.domain}
                  {newTabHint}
                </a>
              )}
            </div>
          </DetailSection>
        )}
      </Card>
    </div>
  );
}

/** Each fact is named for screen readers; salary goes on its own line. */
function JobFacts({ job }: JobDetailProps) {
  return (
    <dl className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-muted">
      {jobFacts(job).map((fact, index) => {
        const isSalary = fact.key === 'salary';
        return (
          <div key={fact.key} className={cn(isSalary && 'basis-full')}>
            <dt className="sr-only">{fact.label}</dt>
            <dd className={cn(isSalary && 'text-ink')}>
              {index > 0 && !isSalary && (
                <span aria-hidden="true" className="mr-2">
                  ·
                </span>
              )}
              {fact.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

interface DetailSectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

/** One part of the details card; a line separates it from the one above. */
function DetailSection({ id, title, children }: DetailSectionProps) {
  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-4 border-line py-6 not-first:border-t"
    >
      <h2 id={id} className="text-xl font-medium text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}

interface SkillGroupProps {
  id: string;
  label: string;
  skills: JobSkill[];
}

function SkillGroup({ id, label, skills }: SkillGroupProps) {
  if (skills.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 id={id} className={cn(overline, 'text-ink-muted')}>
        {label}
      </h3>
      <ul aria-labelledby={id} className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <li
            key={skill.id}
            className="inline-flex h-8 items-center rounded-pill border border-line bg-surface px-3 text-sm font-medium text-ink"
          >
            {skill.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
