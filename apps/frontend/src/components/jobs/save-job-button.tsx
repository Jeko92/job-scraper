'use client';

import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useOptimistic, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { setJobSaved } from '@/lib/jobs/actions';
import { cn } from '@/lib/utils';

const LABEL_CELL = 'col-start-1 row-start-1 text-left';

interface SaveJobButtonProps {
  jobId: string;
  jobTitle: string;
  isSaved: boolean;
}

/** Toggles a job in the saved jobs; flips at once, rolls back on error. */
export function SaveJobButton({
  jobId,
  jobTitle,
  isSaved,
}: SaveJobButtonProps) {
  const [saved, setOptimisticSaved] = useOptimistic(isSaved);
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);

  function handleClick() {
    const next = !saved;
    setErrors([]);
    startTransition(async () => {
      setOptimisticSaved(next);
      const result = await setJobSaved(jobId, next);
      setErrors(result.errors);
    });
  }

  const Icon = saved ? BookmarkCheck : Bookmark;

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={saved}
        aria-label={`Save ${jobTitle}`}
        className="rounded-pill px-4 font-semibold"
      >
        <Icon data-icon="inline-start" aria-hidden="true" />
        <span className="grid">
          <span className={cn(LABEL_CELL, saved && 'invisible')}>Save</span>
          <span className={cn(LABEL_CELL, !saved && 'invisible')}>Saved</span>
        </span>
      </Button>
      {errors.length > 0 && (
        <p role="alert" className="text-sm text-destructive">
          {errors.join(' ')}
        </p>
      )}
    </div>
  );
}
