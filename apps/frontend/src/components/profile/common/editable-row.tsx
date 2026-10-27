'use client';

import type {
  UpdateUserProfileRequest,
  UserProfile,
} from '@job-scraper/shared';
import { Check, CircleCheck, Pencil, Plus, X } from 'lucide-react';
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
import { fieldLabel, overline } from '@/lib/styles';
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
  /**
   * For list rows (skills, industries, places): the row spans the full
   * width, the label is an overline, and ✎ becomes "+ <addLabel>".
   */
  addLabel?: string;
}

// in edit mode the value becomes its field with ✓ (save) and ✕ (cancel).
export function EditableRow<T>({
  label,
  value,
  isOpen,
  editDisabled,
  onEdit,
  onSaved,
  addLabel,
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

  const savedPill = justSaved && (
    <span
      aria-hidden
      className="flex shrink-0 items-center gap-1 rounded-pill bg-status-done px-2 py-0.5 text-xs font-medium text-on-status"
    >
      <CircleCheck className="size-4" />
      Saved
    </span>
  );

  function edit() {
    setJustSaved(false);
    onEdit();
  }

  // View mode, as in the mockup: a field box with ✎, or for list rows the
  // chips followed by "+ Add …".
  function renderView() {
    if (addLabel !== undefined) {
      return (
        <div className="flex flex-wrap items-center gap-2">
          {!isEmpty && value}
          <Button
            ref={editButtonRef}
            type="button"
            variant="outline"
            disabled={editDisabled}
            onClick={edit}
            className="h-8 rounded-pill border-line bg-surface px-3 font-medium text-ink"
          >
            <Plus aria-hidden="true" />
            {addLabel}
          </Button>
          {savedPill}
        </div>
      );
    }
    return (
      <div className="flex min-h-12 items-center gap-2 rounded-card border border-line pr-2 pl-4">
        {/* A div, not a span: the value can be a list (ChipList). */}
        <div
          className={cn(
            'min-w-0 flex-1 py-2',
            isEmpty ? 'text-ink-muted' : 'text-ink',
          )}
        >
          {isEmpty ? NOT_SET : value}
        </div>
        {savedPill}
        <Button
          ref={editButtonRef}
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Edit ${label}`}
          disabled={editDisabled}
          onClick={edit}
        >
          <Pencil />
        </Button>
      </div>
    );
  }

  return (
    // Label above the field. List rows take both columns of the grid.
    <div
      className={cn(
        'flex min-w-0 flex-col gap-2',
        addLabel !== undefined && 'sm:col-span-2',
      )}
    >
      <dt
        className={
          addLabel !== undefined ? cn(overline, 'text-ink-muted') : fieldLabel
        }
      >
        {label}
      </dt>
      <dd className="min-w-0">
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
          renderView()
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
          className="mt-2"
          aria-label={pending ? `Saving ${label}` : `Save ${label}`}
          disabled={pending}
        >
          <Check />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-2"
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
