'use client';

import { useId } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { field, fieldLabel } from '@/lib/styles';
import { cn } from '@/lib/utils';

export interface FieldSelectItem<T> {
  value: T | null;
  label: string;
}

interface FieldSelectProps<T> {
  label: string;
  items: FieldSelectItem<T>[];
  /** null selects the item whose value is null, e.g. "Any time". */
  value: T | null;
  onChange: (value: T | null) => void;
  className?: string;
}

export function FieldSelect<T>({
  label,
  items,
  value,
  onChange,
  className,
}: FieldSelectProps<T>) {
  const labelId = useId();

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span id={labelId} className={fieldLabel}>
        {label}
      </span>
      <Select
        items={items}
        value={value}
        onValueChange={(next) => {
          onChange(next);
        }}
      >
        <SelectTrigger
          aria-labelledby={labelId}
          className={cn(field, 'w-full text-base data-[size=default]:h-12')}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={String(item.value)} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
