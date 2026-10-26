import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  children: ReactNode;
}

export function ProfileSectionCard({ title, children }: SectionCardProps) {
  return (
    <section className="w-full rounded-card border border-line bg-surface soft-glow p-8 sm:p-10">
      <h2 className="mb-4 font-heading text-xl text-ink">{title}</h2>
      {children}
    </section>
  );
}
