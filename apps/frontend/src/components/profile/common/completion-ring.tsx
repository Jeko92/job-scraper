const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface CompletionRingProps {
  /** 0–100. */
  percent: number;
}

// A circle filled to `percent`: a full grey track and a navy arc on top.
// The arc is one dash as long as the filled part (dashoffset hides the rest);
// -90° makes it start at 12 o'clock.
export function CompletionRing({ percent }: CompletionRingProps) {
  return (
    <div
      role="img"
      aria-label={`Profile ${String(percent)}% complete`}
      className="relative size-16 shrink-0"
    >
      <svg viewBox="0 0 64 64" className="size-full -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={RADIUS}
          fill="none"
          strokeWidth="5"
          className="stroke-line"
        />
        <circle
          cx="32"
          cy="32"
          r={RADIUS}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
          className="stroke-ink"
        />
      </svg>
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-ink"
      >
        {percent}%
      </span>
    </div>
  );
}
