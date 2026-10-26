import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import { GlowPanel } from '@/components/landing/glow-panel';
import { SectionChip } from '@/components/landing/section-chip';
import { buttonVariants } from '@/components/ui/button';
import { PROFILE_HREF, SEARCH_HREF } from '@/lib/routes';
import { cn } from '@/lib/utils';

const pill = 'h-11 rounded-pill px-5 text-[0.95rem] font-semibold';

interface WelcomeSectionProps {
  firstName: string;
  className?: string;
}

export function WelcomeSection({ firstName, className }: WelcomeSectionProps) {
  return (
    <GlowPanel
      className={cn(
        'flex flex-col gap-5 rounded-tile border border-line bg-surface p-8 lg:px-12 lg:py-10',
        className,
      )}
    >
      <SectionChip className="self-start">Your overview</SectionChip>

      <h1 className="font-heading text-[2.5rem] leading-[1.1] font-normal text-ink sm:text-[3.25rem]">
        Welcome back, {firstName}.
      </h1>

      <div className="mt-auto flex flex-wrap gap-3">
        <Link href={SEARCH_HREF} className={cn(buttonVariants(), pill)}>
          Search jobs
          <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
        </Link>
        <Link
          href={PROFILE_HREF}
          className={cn(buttonVariants({ variant: 'outline' }), pill)}
        >
          Edit profile
        </Link>
      </div>
    </GlowPanel>
  );
}
