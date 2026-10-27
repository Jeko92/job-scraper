import type { ReactNode } from 'react';

import { overline } from '@/lib/styles';
import { cn } from '@/lib/utils';

interface ProfileGroupProps {
  title: string;
  /** The `EditableRow`s of this group. */
  children: ReactNode;
}

// A group of rows inside a profile tile, e.g. "SKILLS".
export function ProfileGroup({ title, children }: ProfileGroupProps) {
  return (
    <section className="space-y-2">
      <h3 className={cn(overline, 'text-ink-muted')}>{title}</h3>
      <dl className="divide-y divide-line">{children}</dl>
    </section>
  );
}
