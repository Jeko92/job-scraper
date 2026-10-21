import { X } from 'lucide-react';

export interface ChipItem {
  id: string;
  label: string;
}

interface ChipListProps {
  caption: string;
  items: ChipItem[];
  max?: number;
  onRemove: (id: string) => void;
}

// Selected values as navy chips with ✕ (mockup 02 "SELECTED · N").
export function ChipList({ caption, items, max, onRemove }: ChipListProps) {
  const count =
    max === undefined
      ? String(items.length)
      : `${String(items.length)}/${String(max)}`;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium tracking-widest text-ink-muted uppercase">
        {caption} · {count}
      </p>
      {items.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="inline-flex items-center gap-2 rounded-chip bg-ink py-1.5 pr-2 pl-3 text-sm font-medium text-surface"
            >
              {item.label}
              <button
                type="button"
                aria-label={`Remove ${item.label}`}
                className="rounded-full p-0.5 hover:bg-surface/20"
                onClick={() => {
                  onRemove(item.id);
                }}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
