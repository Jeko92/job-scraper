'use client';

import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface Option<T extends string> {
  value: T;
  label: string;
}

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export function OptionButton({ label, selected, onSelect }: OptionButtonProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'inline-flex items-center gap-2 rounded-pill border px-4 py-2 text-sm font-medium transition-colors',
        selected
          ? 'border-ink bg-ink text-surface'
          : 'border-line bg-surface text-ink hover:border-ink',
      )}
    >
      {label}
      {selected && <Check className="size-4" />}
    </button>
  );
}

interface OptionListProps<T extends string> {
  label: string;
  options: Option<T>[];
  value: T | null | undefined;
  onSelect: (value: T) => void;
}

export function OptionList<T extends string>({
  label,
  options,
  value,
  onSelect,
}: OptionListProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-3">
      {options.map((option) => (
        <OptionButton
          key={option.value}
          label={option.label}
          selected={option.value === value}
          onSelect={() => {
            onSelect(option.value);
          }}
        />
      ))}
    </div>
  );
}
