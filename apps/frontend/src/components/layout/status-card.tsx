import type { ReactNode } from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/** Pill style for the button or link passed as `action`. */
export const statusActionClass =
  'mt-2 h-11 rounded-pill px-5 font-semibold text-ink';

interface StatusCardProps {
  title: string;
  message: string;
  action: ReactNode;
  /** `alert` for errors, so screen readers announce them right away. */
  role?: 'alert';
  className?: string;
}

/** Centred card for full-page states such as errors and "not found". */
export function StatusCard({
  title,
  message,
  action,
  role,
  className,
}: StatusCardProps) {
  return (
    <Card
      role={role}
      className={cn(
        'items-center gap-3 rounded-card p-10 text-center ring-line',
        className,
      )}
    >
      <h1 className="font-heading text-2xl text-ink">{title}</h1>
      <p className="text-sm text-ink-muted">{message}</p>
      {action}
    </Card>
  );
}
