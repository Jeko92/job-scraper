'use client';

import { Check } from 'lucide-react';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
} from 'react';

import { cn } from '@/lib/utils';

export interface Option<T extends string> {
  value: T;
  label: string;
}

interface OptionButtonProps {
  label: string;
  /** Shortcut letter shown in front of the label ("A", "B", …). */
  letter: string;
  selected: boolean;
  tabbable: boolean;
  onSelect: () => void;
}

export function OptionButton({
  label,
  letter,
  selected,
  tabbable,
  onSelect,
}: OptionButtonProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-keyshortcuts={letter}
      tabIndex={tabbable ? 0 : -1}
      onClick={onSelect}
      className={cn(
        'inline-flex items-center gap-2 rounded-pill border px-4 py-2 text-sm font-medium transition-colors',
        selected
          ? 'border-ink bg-ink text-surface'
          : 'border-line bg-surface text-ink hover:border-ink',
      )}
    >
      <span
        aria-hidden="true"
        className={selected ? 'text-surface/70' : 'text-ink-muted'}
      >
        {letter}
      </span>
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
  const groupRef = useRef<HTMLDivElement>(null);
  const selectedIndex = options.findIndex((option) => option.value === value);

  // Picks an option and moves focus to it, so Enter goes on from there.
  function pick(index: number) {
    const option = options[index];
    if (!option) {
      return;
    }
    onSelect(option.value);
    groupRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
      [index]?.focus();
  }

  function handleArrows(event: ReactKeyboardEvent<HTMLDivElement>) {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (step === 0) {
      return;
    }
    event.preventDefault();
    const from = selectedIndex === -1 ? (step === 1 ? -1 : 0) : selectedIndex;
    pick((from + step + options.length) % options.length);
  }

  // Typing a letter picks that option.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if (
        typing ||
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      ) {
        return;
      }
      const index = event.key.toUpperCase().charCodeAt(0) - 65;
      if (event.key.length !== 1 || !options[index]) {
        return;
      }
      event.preventDefault();
      pick(index);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  const lastLetter = String.fromCharCode(64 + options.length);

  return (
    <div className="space-y-3">
      <div
        ref={groupRef}
        role="radiogroup"
        aria-label={label}
        className="flex flex-wrap gap-3"
        onKeyDown={handleArrows}
      >
        {options.map((option, index) => (
          <OptionButton
            key={option.value}
            label={option.label}
            letter={String.fromCharCode(65 + index)}
            selected={index === selectedIndex}
            tabbable={index === Math.max(selectedIndex, 0)}
            onSelect={() => {
              onSelect(option.value);
            }}
          />
        ))}
      </div>
      <p className="text-sm text-ink-muted">
        press <strong className="text-ink">A–{lastLetter}</strong> to pick
      </p>
    </div>
  );
}
