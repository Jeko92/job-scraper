'use client';

import { type MouseEvent, type ReactNode, useRef } from 'react';

interface MenuDetailsProps {
  className?: string;
  children: ReactNode;
}

export function MenuDetails({ className, children }: MenuDetailsProps) {
  const ref = useRef<HTMLDetailsElement>(null);

  function closeOnLinkClick(event: MouseEvent<HTMLDetailsElement>) {
    if (event.target instanceof Element && event.target.closest('a')) {
      if (ref.current) {
        ref.current.open = false;
      }
    }
  }

  return (
    <details ref={ref} className={className} onClick={closeOnLinkClick}>
      {children}
    </details>
  );
}
