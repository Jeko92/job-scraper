import { Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface FilterChipProps {
  /** `selected` is removed with its ✕ button, `add` is added by a click anywhere. */
  variant: 'selected' | 'add';
  label: string;
  onClick: () => void;
}

export function FilterChip({ variant, label, onClick }: FilterChipProps) {
  if (variant === 'selected') {
    return (
      <span className="inline-flex h-8 items-center gap-1 rounded-pill bg-primary pr-1 pl-3 text-sm font-medium text-primary-foreground">
        {label}
        <Button
          type="button"
          size="icon-xs"
          onClick={onClick}
          aria-label={`Remove ${label}`}
          className="rounded-full hover:bg-primary-foreground/20"
        >
          <X aria-hidden="true" />
        </Button>
      </span>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      aria-label={`Add ${label}`}
      className="h-8 rounded-pill border-line bg-surface px-3 font-medium text-ink"
    >
      <Plus aria-hidden="true" />
      {label}
    </Button>
  );
}
