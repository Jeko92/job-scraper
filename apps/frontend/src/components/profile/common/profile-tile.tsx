import type { ReactNode } from 'react';

import { LogoMark } from '@/components/brand/logo';

interface ProfileTileProps {
  title: string;
  children: ReactNode;
}

// A tile with the pill title from the mockup, e.g. "Edit profile".
export function ProfileTile({ title, children }: ProfileTileProps) {
  return (
    <section className="rounded-tile border border-line bg-surface p-8">
      <h2 className="mb-6 inline-flex items-center gap-2 rounded-chip border border-line px-3 py-1.5 text-sm text-ink shadow-sm">
        <LogoMark className="size-4" />
        {title}
      </h2>
      {children}
    </section>
  );
}
