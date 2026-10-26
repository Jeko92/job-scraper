'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface JobDetailErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function JobDetailError({ retry }: JobDetailErrorProps) {
  return (
    <main className="flex-1 px-4 pb-12 sm:px-8">
      <Card
        role="alert"
        className="mx-auto w-full max-w-3xl items-center gap-3 rounded-card p-10 text-center ring-line"
      >
        <h1 className="font-heading text-2xl text-ink">
          This job is not available right now
        </h1>
        <p className="text-sm text-ink-muted">
          We could not load this job. Please try again in a moment.
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
