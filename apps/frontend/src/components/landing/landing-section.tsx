import type { ReactNode } from 'react';

import { LogoMark } from '@/components/brand/logo';
import { cn } from '@/lib/utils';

interface LandingSectionProps {
  id: string;
  chip: string;
  /** Two-tone heading: wrap the quiet half in `text-ink-muted`. */
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Tile that frames one landing page section: chip, heading, content. */
export function LandingSection({
  id,
  chip,
  title,
  children,
  className,
}: LandingSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-8 px-4 sm:px-8"
    >
      <div
        className={cn(
          'flex flex-col gap-10 rounded-tile border border-line bg-surface p-8 lg:p-12',
          className,
        )}
      >
        <div className="flex flex-col items-start gap-5">
          <SectionChip>{chip}</SectionChip>
          <h2
            id={headingId}
            className="max-w-3xl font-heading text-[2rem] leading-10 font-normal text-ink sm:text-[2.25rem] sm:leading-[2.625rem]"
          >
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

interface SectionChipProps {
  children: ReactNode;
  className?: string;
}

export function SectionChip({ children, className }: SectionChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-chip border border-line bg-surface px-3 py-1.5 text-[0.8125rem] leading-4 text-ink',
        className,
      )}
    >
      <LogoMark className="size-3.5" />
      {children}
    </span>
  );
}
