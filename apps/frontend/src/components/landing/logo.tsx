import { cn } from '@/lib/utils';

const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

interface LogoMarkProps {
  className?: string;
}

/** Eight-ray burst, the JobScraper mark. Inherits its color from `currentColor`. */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.4}
      strokeLinecap="round"
      aria-hidden="true"
      className={cn('size-6 text-brand', className)}
    >
      {RAY_ANGLES.map((angle) => (
        <line
          key={angle}
          x1="16"
          y1="4"
          x2="16"
          y2="11"
          transform={`rotate(${String(angle)} 16 16)`}
        />
      ))}
    </svg>
  );
}

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-lg font-medium',
        className,
      )}
    >
      <LogoMark />
      JobScraper
    </span>
  );
}
