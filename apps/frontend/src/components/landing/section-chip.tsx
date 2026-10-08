import { Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SectionChipProps {
  children: React.ReactNode;
  className?: string;
}

/** White pill with a sparkle that labels a section. */
export function SectionChip({ children, className }: SectionChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 text-sm text-ink shadow-sm',
        className,
      )}
    >
      <Sparkles className="size-4" aria-hidden="true" />
      {children}
    </span>
  );
}
