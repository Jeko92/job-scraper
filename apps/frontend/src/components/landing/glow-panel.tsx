'use client';

import type { PointerEvent, ReactNode } from 'react';

import { cn } from '@/lib/utils';

const PERCENT = 100;

interface GlowPanelProps {
  children: ReactNode;
  className?: string;
}

export function GlowPanel({ children, className }: GlowPanelProps) {
  function followPointer(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') {
      return;
    }
    const panel = event.currentTarget;
    const rect = panel.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * PERCENT;
    const y = ((event.clientY - rect.top) / rect.height) * PERCENT;
    panel.style.setProperty('--glow-x', `${String(x)}%`);
    panel.style.setProperty('--glow-y', `${String(y)}%`);
  }

  return (
    <div onPointerMove={followPointer} className={cn('soft-glow', className)}>
      {children}
    </div>
  );
}
