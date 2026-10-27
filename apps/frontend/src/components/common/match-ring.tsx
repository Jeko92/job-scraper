import { cn } from '@/lib/utils';

const SIZE = 64;
const STROKE = 6;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const PERCENT = 100;

interface MatchRingProps {
  value: number;
  label: string;
  tone?: 'ink' | 'highlight';
  className?: string;
}

export function MatchRing({
  value,
  label,
  tone = 'ink',
  className,
}: MatchRingProps) {
  const filled = (CIRCUMFERENCE * value) / PERCENT;

  return (
    <svg
      viewBox={`0 0 ${String(SIZE)} ${String(SIZE)}`}
      role="img"
      aria-label={label}
      className={cn('size-16 shrink-0', className)}
    >
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        strokeWidth={STROKE}
        className="stroke-line"
      />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={`${String(filled)} ${String(CIRCUMFERENCE)}`}
        transform={`rotate(-90 ${String(SIZE / 2)} ${String(SIZE / 2)})`}
        className={tone === 'ink' ? 'stroke-ink' : 'stroke-highlight'}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="fill-ink text-[15px] font-semibold"
      >
        {value}%
      </text>
    </svg>
  );
}
