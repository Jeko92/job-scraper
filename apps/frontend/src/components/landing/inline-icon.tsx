import type { LucideIcon } from 'lucide-react';

interface InlineIconProps {
  icon: LucideIcon;
}

/** Orange icon tile that sits inside a line of heading text and scales with it. */
export function InlineIcon({ icon: Icon }: InlineIconProps) {
  return (
    <span
      aria-hidden="true"
      className="mx-[0.12em] inline-flex size-[1.15em] translate-y-[0.15em] items-center justify-center rounded-[0.3em] bg-linear-to-br from-brand to-brand-soft text-white shadow-md shadow-brand/30"
    >
      <Icon className="size-[0.55em]" strokeWidth={2.5} />
    </span>
  );
}
