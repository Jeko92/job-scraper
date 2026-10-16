import { cn } from '@/lib/utils';

type LogoTone = 'default' | 'on-highlight';

const DISC_FILL: Record<LogoTone, string> = {
  default: 'fill-highlight',
  'on-highlight': 'fill-white',
};

const RING_COLOR: Record<LogoTone, string> = {
  default: 'text-current',
  'on-highlight': 'text-on-highlight',
};

interface LogoMarkProps {
  tone?: LogoTone;
  className?: string;
}

export function LogoMark({ tone = 'default', className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn('size-6 shrink-0', RING_COLOR[tone], className)}
    >
      <circle
        data-logo-disc
        cx="11"
        cy="16"
        r="9"
        className={DISC_FILL[tone]}
      />
      <circle
        data-logo-ring
        cx="19"
        cy="16"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.5}
      />
    </svg>
  );
}

interface LogoProps {
  tone?: LogoTone;
  className?: string;
}

export function Logo({ tone = 'default', className }: LogoProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-heading text-2xl leading-6 font-semibold',
        className,
      )}
    >
      <LogoMark tone={tone} />
      JobScraper
    </span>
  );
}
