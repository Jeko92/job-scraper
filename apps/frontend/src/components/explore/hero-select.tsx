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

interface HeroSelectProps {
  label: string;
  /** Submitted with the hero's GET form. */
  name: string;
  /** The first item, with no value; the explore page drops the empty param. */
  anyLabel: string;
  options: { value: string; label: string }[];
}

/**
 * Looks like `FieldSelect`, but uncontrolled, so the hero form submits it
 * like a native select.
 */
export function HeroSelect({
  label,
  name,
  anyLabel,
  options,
}: HeroSelectProps) {
  const labelId = useId();
  const items = [{ value: null, label: anyLabel }, ...options];

  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className={fieldLabel}>
        {label}
      </span>
      <Select<string | null> name={name} items={items} defaultValue={null}>
        <SelectTrigger
          aria-labelledby={labelId}
          className={cn(field, 'w-full text-base data-[size=default]:h-12')}
        >
          <SelectValue />
        </SelectTrigger>
        {/* Drops below the field at its width, like a menu of the field. */}
        <SelectContent
          alignItemWithTrigger={false}
          sideOffset={8}
          className="max-h-[min(20rem,var(--available-height))] rounded-card border border-line bg-surface p-1.5 text-ink shadow-xl ring-0"
        >
          {items.map((item) => (
            <SelectItem
              key={String(item.value)}
              value={item.value}
              // 44px rows: big enough to tap; padding and text like the field.
              className="min-h-11 rounded-chip py-2 pr-10 pl-[calc(1rem-0.375rem)] text-base text-ink focus:bg-bg focus:text-ink data-selected:font-medium"
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
