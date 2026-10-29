import type { KeyboardEventHandler, ReactNode, Ref } from 'react';

import { cn } from '@/lib/utils';

interface OnboardingCardProps {
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
}

export function OnboardingCard({
  children,
  className,
  ref,
  onKeyDown,
}: OnboardingCardProps) {
  return (
    <div
      ref={ref}
      onKeyDown={onKeyDown}
      className={cn(
        'w-full max-w-2xl rounded-card border border-line bg-surface soft-glow p-8 sm:p-10',
        className,
      )}
    >
      {children}
    </div>
  );
}
