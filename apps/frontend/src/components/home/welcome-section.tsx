import { GlowPanel } from '@/components/landing/glow-panel';
import { SectionChip } from '@/components/landing/section-chip';
import { cn } from '@/lib/utils';

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
    </GlowPanel>
  );
}
