import { cn } from '@/lib/utils';

import { SectionChip } from './section-chip';

const RADIUS = 96;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const REASONS = [
  {
    value: 'Direct',
    label: 'Company career sites, not job portals',
    angle: 150,
  },
  { value: 'Fresh', label: 'Every data point is timestamped', angle: -90 },
  { value: 'Shared', label: 'Findings pooled for all job seekers', angle: 90 },
  { value: 'You', label: 'Human in the loop, always', angle: -30 },
] as const;

interface RingProps {
  index: number;
  value: string;
  label: string;
  /** Where the orange arc starts, in degrees clockwise from 3 o'clock. */
  angle: number;
}

function Ring({ index, value, label, angle }: RingProps) {
  const gradientId = `ring-gradient-${String(index)}`;
  const radians = (angle * Math.PI) / 180;
  const dotX = 100 + RADIUS * Math.cos(radians);
  const dotY = 100 + RADIUS * Math.sin(radians);

  return (
    <div
      className={cn(
        'relative aspect-square w-full max-w-64',
        // Overlap the circles on wide screens, like the reference.
        index > 0 && 'lg:-ml-12',
      )}
    >
      <svg
        viewBox="0 0 200 200"
        aria-hidden="true"
        className="absolute inset-0 size-full overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--brand)" />
            <stop offset="100%" stopColor="var(--brand-soft)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          stroke="var(--brand-soft)"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${String(CIRCUMFERENCE * 0.55)} ${String(CIRCUMFERENCE)}`}
          transform={`rotate(${String(angle)} 100 100)`}
        />
        <circle
          cx={dotX}
          cy={dotY}
          r="6"
          fill="var(--surface-warm)"
          stroke="var(--brand)"
          strokeWidth="2.5"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <p className="text-4xl font-light tracking-tight text-ink sm:text-5xl">
          {value}
        </p>
        <p className="mt-2 text-sm text-ink/60">{label}</p>
      </div>
    </div>
  );
}

export function MetricsRings() {
  return (
    <section
      id="why"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6"
    >
      <div className="rounded-card border border-black/5 bg-white/60 bg-warm-glow px-6 py-12 sm:px-10">
        <SectionChip>Why JobScraper</SectionChip>
        <div className="mt-12 grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:flex lg:justify-center lg:gap-0">
          {REASONS.map((reason, index) => (
            <Ring key={reason.value} index={index} {...reason} />
          ))}
        </div>
      </div>
    </section>
  );
}
