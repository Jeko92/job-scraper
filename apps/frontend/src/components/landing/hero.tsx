import { ChevronDown, Circle } from 'lucide-react';

import { Logo, LogoMark } from '@/components/brand/logo';
import { cn } from '@/lib/utils';

import { GlowPanel } from './glow-panel';

const overline = 'text-xs leading-4 font-semibold tracking-widest uppercase';

const fieldLabel = 'text-sm text-ink-muted';

const field =
  'flex h-12 items-center rounded-card border border-line bg-surface px-4 text-ink';

export function Hero() {
  return (
    <section className="px-4 sm:px-8">
      <div className="grid overflow-hidden rounded-tile border border-line bg-surface lg:grid-cols-[5fr_9fr]">
        <div className="flex min-h-56 flex-col justify-between bg-highlight p-8 text-on-highlight lg:min-h-110">
          <p className={overline}>JobScraper</p>
          <LogoMark
            tone="on-highlight"
            className="mx-auto size-32 lg:size-40"
          />
          <p className={overline}>Job matching</p>
        </div>

        <GlowPanel className="flex flex-col gap-6 p-8 lg:px-12 lg:py-12">
          <Logo className="text-ink" />

          <h1 className="font-heading text-[2.5rem] leading-[1.1] font-normal text-ink sm:text-[3.5rem] sm:leading-15">
            Every open role,
            <br className="hidden sm:block" />
            found for you.
          </h1>

          <p className="max-w-3xl text-ink-muted">
            JobScraper reads company career pages and{' '}
            <span className="text-ink">matches every role</span> to the people
            it fits. Look around first, no account needed.
          </p>

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="flex flex-col gap-2">
              <span className={fieldLabel}>What</span>
              <div className={field}>Frontend Developer</div>
            </div>
            <div className="flex flex-col gap-2">
              <span className={fieldLabel}>Where</span>
              <div className={cn(field, 'justify-between')}>
                Berlin
                <ChevronDown className="size-5" aria-hidden="true" />
              </div>
            </div>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-primary px-5 font-semibold text-primary-foreground"
            >
              Explore jobs
              <Circle className="size-3.5" strokeWidth={3} aria-hidden="true" />
            </button>
          </div>
        </GlowPanel>
      </div>
    </section>
  );
}
