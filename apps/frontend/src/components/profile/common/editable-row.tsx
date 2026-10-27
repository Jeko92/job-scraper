'use client';

import type {
  UpdateUserProfileRequest,
  UserProfile,
} from '@job-scraper/shared';
import { Check, CircleCheck, Pencil, X } from 'lucide-react';
import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';

import { FormErrors } from '@/components/auth/form-errors';
import { Button } from '@/components/ui/button';
import { submitProfile } from '@/lib/profile/actions';
import { fieldLabel } from '@/lib/styles';
import { cn } from '@/lib/utils';

const NOT_SET = 'Not set';
// How long the "Saved" pill stays after a save.
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
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(isOpen);
  const isEmpty = value === undefined || value === null || value === '';

  // Hide the "Saved" pill again a few seconds after saving.
  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => {
      setJustSaved(false);
    }, SAVED_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [justSaved]);

  // When the row closes (save, cancel, Escape), its ✓ / ✕ buttons disappear.
  // Put the focus back on ✎ so keyboard users stay on this row.
  useEffect(() => {
    if (wasOpen.current && !isOpen) editButtonRef.current?.focus();
    wasOpen.current = isOpen;
  }, [isOpen]);

  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:gap-4">
      <dt className={cn(fieldLabel, 'shrink-0 sm:w-40 sm:pt-2')}>{label}</dt>
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
            {/* A div, not a span: the value can be a list (ChipList). */}
            <div
              className={
                isEmpty
                  ? 'min-w-0 flex-1 text-ink-muted'
                  : 'min-w-0 flex-1 text-ink'
              }
            >
              {isEmpty ? NOT_SET : value}
            </div>
            {justSaved && (
              <span
                aria-hidden
                className="flex items-center gap-1 rounded-pill bg-status-done px-2 py-0.5 text-xs font-medium text-on-status"
              >
                <CircleCheck className="size-4" />
                Saved
              </span>
            )}
            <Button
              ref={editButtonRef}
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
    // Nothing changed: close without calling the server.
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
        // Not while saving: the request would still finish and close
        // another row that was opened in the meantime.
        if (event.key === 'Escape' && !pending) onClose();
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
