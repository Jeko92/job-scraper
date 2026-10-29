'use client';

import { statusActionClass, StatusCard } from '@/components/layout/status-card';
import { Button } from '@/components/ui/button';

interface SearchErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function SearchError({ retry }: SearchErrorProps) {
  return (
    <main className="flex-1 px-4 pb-12 sm:px-8">
      <StatusCard
        role="alert"
        title="Jobs are not available right now"
        message="We could not load jobs. Please try again in a moment."
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
      />
    </main>
  );
}
