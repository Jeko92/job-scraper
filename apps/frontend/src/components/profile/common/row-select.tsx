'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface RowSelectItem<T> {
  value: T;
  label: string;
}

interface RowSelectProps<T> {
  label: string;
  items: RowSelectItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Shown while no item matches the value. */
  placeholder?: string;
}

export function RowSelect<T>({
  label,
  items,
  value,
  onChange,
  placeholder,
}: RowSelectProps<T>) {
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(next) => {
        onChange(next as T);
      }}
    >
      <SelectTrigger
        autoFocus
        aria-label={label}
        className="w-full rounded-card px-4 text-base data-[size=default]:h-12"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={String(item.value)} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** "Not set" first, then one item per enum value with its label. */
export function enumItems<T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): RowSelectItem<T | null>[] {
  return [
    { value: null, label: 'Not set' },
    ...values.map((value) => ({ value, label: labels[value] })),
  ];
}
