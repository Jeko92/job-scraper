interface LoadErrorProps {
  subject: string;
}

export function LoadError({ subject }: LoadErrorProps) {
  return (
    <p className="text-sm text-ink-muted">
      {subject} could not be loaded right now. Please try again later.
    </p>
  );
}
