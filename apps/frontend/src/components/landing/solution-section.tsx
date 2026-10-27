import { Building2, Users } from 'lucide-react';

import { overline } from '@/lib/styles';
import { cn } from '@/lib/utils';

import { LandingSection } from './landing-section';

const POINTS = [
  {
    icon: Building2,
    title: 'Go to the source',
    text: 'JobScraper reads company career pages and shows you roles where they are published first, so you apply where the hiring team looks.',
  },
  {
    icon: Users,
    title: 'Face far less competition',
    text: 'Most people only search the big portals. Roles on career pages see far fewer applicants, which gives you a real edge.',
  },
];

// Illustrative applicant counts for the comparison graphic, not real data.
const PORTAL_APPLICANTS = 47;
const CAREER_PAGE_APPLICANTS = 5;

export function SolutionSection() {
  return (
    <LandingSection
      id="solution"
      chip="The solution"
      title={
        <>
          Apply to companies directly.{' '}
          <span className="text-ink-muted">Where far fewer people apply.</span>
        </>
      }
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <ul className="flex flex-col gap-8">
          {POINTS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-chip bg-highlight text-on-highlight">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl leading-7 font-medium text-ink">
                  {title}
                </h3>
                <p className="text-ink-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="sr-only grid gap-2 sm:grid-cols-2" aria-hidden="true">
          <CrowdPanel
            label="Job portal"
            others={PORTAL_APPLICANTS}
            className="bg-bg"
          />
          <CrowdPanel
            label="Career page"
            others={CAREER_PAGE_APPLICANTS}
            className="bg-linear-to-br from-highlight/25 to-bg"
          />
        </div>
      </div>
    </LandingSection>
  );
}

interface CrowdPanelProps {
  label: string;
  others: number;
  className?: string;
}

/** Dots for other applicants, with one highlighted dot for "you". */
function CrowdPanel({ label, others, className }: CrowdPanelProps) {
  return (
    <div
      className={cn(
        'flex min-h-56 flex-col justify-between gap-6 rounded-card border border-line p-6',
        className,
      )}
    >
      <p className={cn(overline, 'text-ink-muted')}>{label}</p>
      <div className="grid grid-cols-8 gap-2">
        {Array.from({ length: others }, (_, index) => (
          <span key={index} className="size-3 rounded-full bg-line" />
        ))}
        <span className="size-3 rounded-full bg-highlight ring-4 ring-highlight/30" />
      </div>
      <p className="text-sm text-ink">
        You <span className="text-ink-muted">and {others} others</span>
      </p>
    </div>
  );
}
