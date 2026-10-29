import { ArrowUpRight, CalendarDays, Globe, Link2 } from 'lucide-react';

import { LogoMark } from '@/components/brand/logo';
import { overline } from '@/lib/styles';
import { cn } from '@/lib/utils';

import { LandingSection } from './landing-section';

// Only claims the product already backs up on every job detail page.
const FACTS = [
  {
    icon: Link2,
    title: 'Every role links to its source',
    text: 'One click takes you to the original posting on the company’s own career page.',
  },
  {
    icon: Globe,
    title: 'You always see who is hiring',
    text: 'Each role names the company and links to its website. No anonymous listings.',
  },
  {
    icon: CalendarDays,
    title: 'You see how fresh a role is',
    text: 'Every role shows when it was posted, so you can tell new openings from old ones.',
  },
];

export function TrustSection() {
  return (
    <LandingSection
      id="trust"
      chip="Transparency"
      title={
        <>
          Real roles from real companies.{' '}
          <span className="text-ink-muted">Check every one yourself.</span>
        </>
      }
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <ul className="flex flex-col gap-8">
          {FACTS.map(({ icon: Icon, title, text }) => (
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

        <SourceTrail />
      </div>
    </LandingSection>
  );
}

/** Illustration: a role travels from a career page through JobScraper to you. */
function SourceTrail() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col items-center rounded-card border border-line bg-linear-to-b from-bg to-highlight/20 p-6"
    >
      <div className="w-full max-w-sm rounded-card border border-line bg-surface p-4">
        <p className="mb-3 flex items-center gap-2 text-sm text-ink-muted">
          <Globe className="size-4" />
          careers.example.com
        </p>
        <ul className="flex flex-col gap-2 text-sm">
          <SourceRow title="Frontend Developer" highlighted />
          <SourceRow title="Product Designer" />
          <SourceRow title="Data Engineer" />
        </ul>
      </div>

      <span className="h-6 w-px bg-ink-muted/40" />
      <span className="inline-flex size-12 items-center justify-center rounded-full border border-line bg-surface">
        <LogoMark className="size-6 text-ink" />
      </span>
      <span className="h-6 w-px bg-ink-muted/40" />

      <div className="flex w-full max-w-sm flex-col gap-3 rounded-card border border-line bg-surface p-4">
        <div>
          <p className="font-medium text-ink">Frontend Developer</p>
          <p className="text-sm text-ink-muted">Example GmbH · Berlin</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-ink-muted">Posted 2 days ago</p>
          <span className="inline-flex items-center gap-1 rounded-pill bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
            View original posting
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

function SourceRow({
  title,
  highlighted = false,
}: {
  title: string;
  highlighted?: boolean;
}) {
  return (
    <li
      className={cn(
        'flex items-center justify-between rounded-chip px-3 py-2',
        highlighted ? 'bg-highlight/20 text-ink' : 'text-ink-muted',
      )}
    >
      {title}
      {highlighted && <span className={cn(overline, 'text-ink')}>Match</span>}
    </li>
  );
}
