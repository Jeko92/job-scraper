'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SearchErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function SearchError({ retry }: SearchErrorProps) {
  return (
    <main className="flex-1 px-4 pb-12 sm:px-8">
      <Card
        role="alert"
        className="items-center gap-3 rounded-card p-10 text-center ring-line"
      >
        <h1 className="font-heading text-2xl text-ink">
          Jobs are not available right now
        </h1>
        <p className="text-sm text-ink-muted">
          We could not load jobs. Please try again in a moment.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            retry();
          }}
          className="mt-2 h-11 rounded-pill px-5 font-semibold text-ink"
        >
          Try again
        </Button>
      </Card>
    </main>
  );
}
