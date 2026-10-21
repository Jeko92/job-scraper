'use client';

import type { UpdateUserProfileRequest } from '@job-scraper/shared';
import { CornerDownLeft } from 'lucide-react';
import { useState, useTransition } from 'react';

import { FormErrors } from '@/components/auth/form-errors';
import { Button } from '@/components/ui/button';
import { submitOnboarding } from '@/lib/profile/actions';

interface SubmitOnboardingButtonProps {
  answers: UpdateUserProfileRequest;
}

export function SubmitOnboardingButton({
  answers,
}: SubmitOnboardingButtonProps) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);

  function handleSubmit() {
    setErrors([]);
    startTransition(async () => {
      const result = await submitOnboarding(answers);
      setErrors(result.errors);
    });
  }

  return (
    <div className="space-y-4">
      {errors.length > 0 && <FormErrors errors={errors} />}
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={pending}
        className="rounded-pill px-6"
      >
        {pending ? 'Saving…' : 'Submit'}
        <CornerDownLeft data-icon="inline-end" />
      </Button>
    </div>
  );
}
