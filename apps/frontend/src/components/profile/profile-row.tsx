import type { ReactNode } from 'react';

const NOT_SET = 'Not set';

interface ProfileRowProps {
  label: string;
  value: ReactNode;
}

// Read label and value in profile card.
//TODO: Refactot it to use it in onboarding.
export function ProfileRow({ label, value }: ProfileRowProps) {
  const isEmpty =
    value === undefined || value === null || value === '' || value === false;

  return (
    <div className="flex items-center gap-4 py-3">
      <dt className="w-40 shrink-0 text-xs font-medium tracking-widest text-ink-muted uppercase">
        {label}
      </dt>
      <dd className={isEmpty ? 'flex-1 text-ink-muted' : 'flex-1 text-ink'}>
        {isEmpty ? NOT_SET : value}
      </dd>
    </div>
  );
}
