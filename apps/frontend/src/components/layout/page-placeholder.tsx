interface PagePlaceholderProps {
  title: string;
}

export function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <main className="flex-1 px-4 py-12 sm:px-8">
      <h1 className="font-heading text-4xl text-ink">{title}</h1>
    </main>
  );
}
