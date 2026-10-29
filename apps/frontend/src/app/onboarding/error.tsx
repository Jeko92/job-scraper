'use client';

import { statusActionClass, StatusCard } from '@/components/layout/status-card';
import { Button } from '@/components/ui/button';

interface OnboardingErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function OnboardingError({ retry }: OnboardingErrorProps) {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <StatusCard
        role="alert"
        title="Your profile is not available right now"
        message="We could not load your profile. Please try again in a moment."
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
        className="w-full max-w-xl"
      />
    </main>
  );
}
