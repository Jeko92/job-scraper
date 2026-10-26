'use client';

import { statusActionClass, StatusCard } from '@/components/layout/status-card';
import { Button } from '@/components/ui/button';

interface JobDetailErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function JobDetailError({ retry }: JobDetailErrorProps) {
  return (
    <main className="flex-1 px-4 pb-12 sm:px-8">
      <StatusCard
        role="alert"
        title="This job is not available right now"
        message="We could not load this job. Please try again in a moment."
        action={
          <Button
            variant="outline"
            onClick={() => {
              retry();
            }}
            className={statusActionClass}
          >
            Try again
          </Button>
        }
        className="mx-auto w-full max-w-3xl"
      />
    </main>
  );
}
