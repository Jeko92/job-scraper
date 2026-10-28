import {
  PREVIEW_CITIES,
  PREVIEW_SKILL_LABELS,
  PREVIEW_SKILLS,
} from '@job-scraper/shared';
import { ChevronDown, Circle } from 'lucide-react';

import { AnimatedLogoMark } from '@/components/brand/animated-logo-mark';
import { Logo } from '@/components/brand/logo';
import { EXPLORE_HREF } from '@/lib/routes';
import { field, fieldLabel, overline } from '@/lib/styles';
import { cn } from '@/lib/utils';

import { GlowPanel } from './glow-panel';

export function Hero() {
  return (
    <section className="px-4 sm:px-8">
      <div className="grid overflow-hidden rounded-tile border border-line bg-surface lg:grid-cols-[5fr_9fr]">
        <div className="flex min-h-56 flex-col justify-between overflow-hidden bg-highlight p-8 text-on-highlight lg:min-h-110">
          <p className={overline}>JobScraper</p>
          <AnimatedLogoMark className="mx-auto size-32 lg:size-40" />
          <p className={overline}>Job matching</p>
        </div>

        <GlowPanel className="flex flex-col gap-6 p-8 lg:px-12 lg:py-12">
          <Logo className="text-ink" />

          <h1 className="font-heading text-[2.5rem] leading-[1.1] font-normal text-ink sm:text-[3.5rem] sm:leading-15">
            Find hiring
            <br className="hidden sm:block" /> companies.
          </h1>

          <p className="max-w-3xl text-ink-muted">
            JobScraper reads company career pages and{' '}
            <span className="text-ink">matches every role</span> to the people
            it fits. Look around first, no account needed.
          </p>

          {/* A plain GET form: works without JavaScript. */}
          <form
            action={EXPLORE_HREF}
            className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <HeroSelect
              label="What"
              name="skill"
              anyLabel="Any skill"
              options={PREVIEW_SKILLS.map((value) => ({
                value,
                label: PREVIEW_SKILL_LABELS[value],
              }))}
            />
            <HeroSelect
              label="Where"
              name="city"
              anyLabel="Anywhere"
              options={PREVIEW_CITIES.map((value) => ({ value, label: value }))}
            />
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-primary px-5 font-semibold text-primary-foreground"
            >
              Explore jobs
              <Circle className="size-3.5" strokeWidth={3} aria-hidden="true" />
            </button>
          </form>
        </GlowPanel>
      </div>
    </section>
  );
}

interface HeroSelectProps {
  label: string;
  name: string;
  /** The empty first option; the explore page drops the empty value. */
  anyLabel: string;
  options: { value: string; label: string }[];
}

function HeroSelect({ label, name, anyLabel, options }: HeroSelectProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className={fieldLabel}>{label}</span>
      <span className="relative">
        <select
          name={name}
          defaultValue=""
          className={cn(
            field,
            'w-full cursor-pointer appearance-none pr-10 outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          )}
        >
          <option value="">{anyLabel}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-ink"
          aria-hidden="true"
        />
      </span>
    </label>
  );
}
