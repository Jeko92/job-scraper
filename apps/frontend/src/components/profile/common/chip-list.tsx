interface ChipListProps {
  labels: string[];
  /** Show "1. …", "2. …" when the order is a priority. */
  numbered?: boolean;
}

export function ChipList({ labels, numbered = false }: ChipListProps) {
  return (
    <ul className="flex flex-wrap gap-2">
      {labels.map((label, index) => (
        <li
          key={label}
          className="inline-flex h-8 items-center rounded-pill bg-primary px-3 text-sm font-medium text-primary-foreground"
        >
          {numbered ? `${String(index + 1)}. ${label}` : label}
        </li>
      ))}
    </ul>
  );
}
