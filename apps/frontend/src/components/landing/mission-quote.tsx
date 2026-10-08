import { Building2, Send, Sparkles } from 'lucide-react';

import { InlineIcon } from './inline-icon';
import { LogoMark } from './logo';
import { SectionChip } from './section-chip';

const PROJECT_FACTS = [
  ['Project', 'JobScraper'],
  ['Category', 'AI job sourcing'],
  ['Built by', 'neuefische bootcamp team'],
] as const;

export function MissionQuote() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col justify-between gap-12 rounded-card border border-black/5 bg-white/70 p-7 sm:p-10">
          <SectionChip className="self-start">Our mission</SectionChip>

          <blockquote className="text-[1.7rem] leading-snug font-light tracking-tight text-ink sm:text-[2.1rem]">
            <span aria-hidden="true" className="mr-1 text-ink/30">
              &ldquo;
            </span>
            <span className="text-ink/45">We needed a </span>
            smarter <InlineIcon icon={Sparkles} /> job search
            <span className="text-ink/45"> that skips the </span>
            portals <InlineIcon icon={Building2} />
            <span className="text-ink/45"> and goes </span>
            straight to company career pages <InlineIcon icon={Send} />
          </blockquote>

          <dl className="grid gap-1 text-sm text-ink/60">
            {PROJECT_FACTS.map(([term, value]) => (
              <div key={term} className="flex gap-1">
                <dt>{term} /</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative flex min-h-96 flex-col justify-between overflow-hidden rounded-card bg-ink p-7 text-white sm:p-10">
          <LogoMark className="absolute -top-10 -right-10 size-64 text-brand/25" />
          <p className="relative text-sm tracking-widest text-white/50 uppercase">
            Vision
          </p>
          <p className="relative max-w-md text-2xl leading-snug font-light sm:text-3xl">
            Job sourcing should be accessible to everyone, automated with
            agentic tools and independent of recruiters&apos; influence.
          </p>
          <div className="relative flex items-center justify-between gap-4 rounded-3xl bg-white p-4 text-ink">
            <div>
              <p className="font-medium">The JobScraper team</p>
              <p className="text-sm text-ink/55">For every job seeker</p>
            </div>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-ink">
              <LogoMark className="size-6 text-white" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
