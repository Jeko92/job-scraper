'use client';

import type {
  UpdateUserProfileRequest,
  UserProfile,
} from '@job-scraper/shared';
import { Check, CircleCheck, Pencil, X } from 'lucide-react';
import { type ReactNode, useEffect, useState, useTransition } from 'react';

import { FormErrors } from '@/components/auth/form-errors';
import { Button } from '@/components/ui/button';
import { submitProfile } from '@/lib/profile/actions';

const NOT_SET = 'Not set';
// After saving:the green check stays after a save.
const SAVED_MS = 3000;

export interface RowControl {
  isOpen: boolean;
  editDisabled: boolean;
  onEdit: () => void;
  onClose: () => void;
  onSaved: (profile: UserProfile) => void;
}

interface EditableRowProps<T> extends RowControl {
  label: string;
  /** Read-only value; empty shows "Not set". */
  value: ReactNode;
  initialDraft: T;
  renderEditor: (draft: T, setDraft: (draft: T) => void) => ReactNode;
  /** The PATCH body for this row, or errors that stop the save. */
  buildRequest: (draft: T) => UpdateUserProfileRequest | string[];
}

// in edit mode the value becomes its field with ✓ (save) and ✕ (cancel).
export function EditableRow<T>({
  label,
  value,
  isOpen,
  editDisabled,
  onEdit,
  onSaved,
  ...editor
}: EditableRowProps<T>) {
  const [justSaved, setJustSaved] = useState(false);
  const isEmpty =
    value === undefined || value === null || value === '' || value === false;

  // Hide the green check again after a few seconds from saving.
  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => {
      setJustSaved(false);
    }, SAVED_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [justSaved]);

  return (
    <div className="flex items-start gap-4 py-3">
      <dt className="w-40 shrink-0 pt-2 text-xs font-medium tracking-widest text-ink-muted uppercase">
        {label}
      </dt>
      <dd className="min-w-0 flex-1">
        {isOpen ? (
          <RowEditor
            label={label}
            {...editor}
            onSaved={(profile) => {
              setJustSaved(true);
              onSaved(profile);
            }}
          />
        ) : (
          <div className="flex items-center gap-2">
            <span
              className={isEmpty ? 'flex-1 text-ink-muted' : 'flex-1 text-ink'}
            >
              {isEmpty ? NOT_SET : value}
            </span>
            {justSaved && (
              <CircleCheck
                aria-hidden
                className="size-5 text-green-600 dark:text-green-400"
              />
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Edit ${label}`}
              disabled={editDisabled}
              onClick={() => {
                setJustSaved(false);
                onEdit();
              }}
            >
              <Pencil />
            </Button>
          </div>
        )}
        <span role="status" className="sr-only">
          {justSaved ? `${label} saved` : ''}
        </span>
      </dd>
    </div>
  );
}

type RowEditorProps<T> = Pick<
  EditableRowProps<T>,
  | 'label'
  | 'initialDraft'
  | 'renderEditor'
  | 'buildRequest'
  | 'onClose'
  | 'onSaved'
>;

// Mounted only while the row is open, so every open starts a fresh draft.
function RowEditor<T>({
  label,
  initialDraft,
  renderEditor,
  buildRequest,
  onClose,
  onSaved,
}: RowEditorProps<T>) {
  const [draft, setDraft] = useState(initialDraft);
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);

  function save() {
    //avoid call the server when the value hasn't been changed.
    if (JSON.stringify(draft) === JSON.stringify(initialDraft)) {
      onClose();
      return;
    }

    const request = buildRequest(draft);
    if (Array.isArray(request)) {
      setErrors(request);
      return;
    }

    setErrors([]);
    startTransition(async () => {
      const result = await submitProfile(request);
      if (result.profile === null) {
        setErrors(result.errors);
        return;
      }
      onSaved(result.profile);
    });
  }

  return (
    <form
      noValidate
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">{renderEditor(draft, setDraft)}</div>
        <Button
          type="submit"
          size="icon"
          aria-label={pending ? `Saving ${label}` : `Save ${label}`}
          disabled={pending}
        >
          <Check />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Cancel editing ${label}`}
          disabled={pending}
          onClick={onClose}
        >
          <X />
        </Button>
      </div>
      {errors.length > 0 && <FormErrors errors={errors} />}
    </form>
  );
}
