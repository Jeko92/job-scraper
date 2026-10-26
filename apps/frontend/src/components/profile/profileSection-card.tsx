import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

interface SectioCardProps {
  title: string;
  children: ReactNode;
  onEdit?: () => void;
}

export function ProfileSectionCard({
  title,
  children,
  onEdit,
}: SectioCardProps) {
  return (
    <section className="w-full rounded-card border border-line bg-surface soft-glow p-8 sm:p-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-xl text-ink">{title}</h2>
        <Button type="button" variant="outline" onClick={onEdit}>
          Edit
        </Button>
      </div>
      {children}
    </section>
  );
}
