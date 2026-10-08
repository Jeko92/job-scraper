import { Bell, Building2, MapPin, Search, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

import { CtaLinks } from './cta-links';
import { InlineIcon } from './inline-icon';
import { SectionChip } from './section-chip';

// Fictional sample data for the product mockup.
const SAMPLE_MATCHES = [
  {
    role: 'Frontend Developer',
    company: 'Nordlicht Software',
    city: 'Hamburg',
    match: 92,
  },
  {
    role: 'Junior Data Analyst',
    company: 'Elbwerk Robotics',
    city: 'Berlin',
    match: 87,
  },
  {
    role: 'Full-Stack Engineer',
    company: 'Kranich Health',
    city: 'Remote',
    match: 81,
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-warm-glow">
      {/* Giant faded wordmark, echoing the reference's "FamilyAI" backdrop. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[-0.18em] text-center text-[19vw] leading-none font-semibold tracking-tighter text-brand/8 select-none"
      >
        JobScraper
      </span>

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 pt-14 pb-24 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-24 lg:pb-36">
        <div className="flex flex-col items-start gap-7">
          <SectionChip>AI-assisted job sourcing</SectionChip>

          <h1 className="text-[2.6rem] leading-[1.08] font-light tracking-tight text-ink sm:text-6xl">
            Find the jobs <InlineIcon icon={Search} />
            <span className="text-ink/45"> job portals </span>
            never <InlineIcon icon={Sparkles} /> show you.
          </h1>

          <p className="max-w-xl text-lg text-ink/65">
            JobScraper searches company career sites directly, matches every
            opening against your profile and tells you when something fits. No
            recruiters in between.
          </p>

          <CtaLinks />
        </div>

        <ProductMockup />
      </div>
    </section>
  );
}

function ProductMockup() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:ml-auto">
      {/* Floating notification card. */}
      <div className="absolute -top-6 -left-4 z-10 flex w-64 items-center gap-3 rounded-2xl border border-black/5 bg-white p-3 shadow-xl motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in motion-safe:slide-in-from-top-4 sm:-left-12">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
          <Bell className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 text-sm">
          <p className="flex justify-between gap-2 font-medium text-ink">
            New match found
            <span className="font-normal text-ink/45">1h ago</span>
          </p>
          <p className="truncate text-ink/60">Frontend Developer · Hamburg</p>
        </div>
      </div>

      <div className="rounded-card border border-black/5 bg-white/80 p-4 shadow-2xl shadow-brand/10 backdrop-blur sm:p-5">
        <p className="px-2 pt-6 text-sm text-ink/50">Thursday, 8 October</p>
        <p className="px-2 pb-4 text-lg font-medium text-ink">
          Good morning, Alex
        </p>

        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand to-brand-soft p-5 text-white">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs">
            <Sparkles className="size-3" aria-hidden="true" />
            AI runner
          </span>
          <p className="mt-3 text-2xl leading-tight font-light">
            3 new jobs
            <br />
            match your profile
          </p>
          <span className="mt-4 inline-flex rounded-full bg-ink px-4 py-2 text-sm">
            View matches
          </span>
          <Building2
            aria-hidden="true"
            className="absolute -right-4 -bottom-4 size-28 text-white/15"
          />
        </div>

        <div className="mt-4 flex items-center justify-between px-2">
          <p className="font-medium text-ink">Today&apos;s matches</p>
          <p className="text-sm text-ink/45">View all</p>
        </div>

        <ul className="mt-2 grid gap-2">
          {SAMPLE_MATCHES.map((job) => (
            <li
              key={job.company}
              className="flex items-center gap-3 rounded-2xl bg-surface-warm p-3"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white font-semibold text-brand shadow-sm">
                {job.company.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {job.role}
                </p>
                <p className="flex items-center gap-1 truncate text-xs text-ink/55">
                  {job.company}
                  <MapPin className="ml-1 size-3" aria-hidden="true" />
                  {job.city}
                </p>
              </div>
              <Badge className="bg-brand/12 text-brand-strong">
                {job.match}%
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
