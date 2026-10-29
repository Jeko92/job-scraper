'use client';

import { type ReactNode, useEffect, useRef } from 'react';

import { LogoMark } from '@/components/brand/logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  EMPLOYMENT_TYPE_LABELS,
  REMOTE_PREFERENCE_LABELS,
  SENIORITY_LABELS,
} from '@/lib/common/enum-labels';
import type { LookupOption } from '@/lib/lookups/types';

import { OnboardingCard } from '../onboarding-card';
import type { Answers, Step } from '../onboarding-state';
import { SubmitOnboardingButton } from '../submit-onboarding-button';

const NOT_SET = 'Not set';

interface ReviewStepProps {
  answers: Answers;
  location: LookupOption | null;
  relocationPlaces: LookupOption[];
  skills: LookupOption[];
  industries: LookupOption[];
  onEdit: (step: Step) => void;
  onBack: () => void;
}

export function ReviewStep({
  answers,
  location,
  relocationPlaces,
  skills,
  industries,
  onEdit,
  onBack,
}: ReviewStepProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { preferences } = answers;

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const relocate = preferences?.willingToRelocate;
  const years = answers.yearsExperience;

  return (
    <OnboardingCard className="space-y-8">
      <Badge variant="outline" className="h-7 gap-2 rounded-pill px-3 text-ink">
        <LogoMark className="size-4" />
        Review
      </Badge>

      <div className="space-y-3">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-heading text-3xl text-ink outline-none sm:text-4xl"
        >
          Check your answers
        </h1>
        <p className="text-ink-muted">
          Edit anything you like, then submit. You can change it later in your
          profile.
        </p>
      </div>

      <dl className="divide-y divide-line">
        <ReviewRow
          label="Role"
          value={answers.headline}
          onEdit={() => {
            onEdit('essentials');
          }}
        />
        <ReviewRow
          label="Based in"
          value={location?.label}
          onEdit={() => {
            onEdit('essentials');
          }}
        />
        <ReviewRow
          label="Seniority"
          value={answers.seniority && SENIORITY_LABELS[answers.seniority]}
          onEdit={() => {
            onEdit('seniority');
          }}
        />
        <ReviewRow
          label="Employment type"
          value={
            preferences?.employmentType &&
            EMPLOYMENT_TYPE_LABELS[preferences.employmentType]
          }
          onEdit={() => {
            onEdit('employment');
          }}
        />
        <ReviewRow
          label="Work setup"
          value={
            preferences?.remotePreference &&
            REMOTE_PREFERENCE_LABELS[preferences.remotePreference]
          }
          onEdit={() => {
            onEdit('workSetup');
          }}
        />
        <ReviewRow
          label="Open to relocating"
          value={relocate === undefined ? undefined : relocate ? 'Yes' : 'No'}
          onEdit={() => {
            onEdit('relocate');
          }}
        />
        {relocate === true && (
          <ReviewRow
            label="Relocation places"
            value={
              relocationPlaces.length > 0 && (
                <ReviewChips options={relocationPlaces} />
              )
            }
            onEdit={() => {
              onEdit('relocate');
            }}
          />
        )}
        <ReviewRow
          label="Experience"
          value={
            years === undefined || years === null
              ? undefined
              : `${String(years)} years`
          }
          onEdit={() => {
            onEdit('experienceYears');
          }}
        />
        <ReviewRow
          label="Skills"
          value={skills.length > 0 && <ReviewChips options={skills} />}
          onEdit={() => {
            onEdit('skills');
          }}
        />
        <ReviewRow
          label="Industries"
          value={
            industries.length > 0 && (
              <ReviewChips options={industries} numbered />
            )
          }
          onEdit={() => {
            onEdit('industries');
          }}
        />
      </dl>

      <div className="flex flex-wrap items-start gap-4">
        <Button variant="ghost" className="rounded-pill" onClick={onBack}>
          Back
        </Button>
        <SubmitOnboardingButton answers={answers} />
      </div>
    </OnboardingCard>
  );
}

interface ReviewChipsProps {
  options: LookupOption[];
  /** "1. …", "2. …" when the order is a priority. */
  numbered?: boolean;
}

// Read-only chips for the list answers.
function ReviewChips({ options, numbered = false }: ReviewChipsProps) {
  return (
    <span className="flex flex-wrap gap-2">
      {options.map((option, index) => (
        <span
          key={option.value}
          className="rounded-chip bg-ink px-3 py-1 text-sm font-medium text-surface"
        >
          {numbered ? `${String(index + 1)}. ${option.label}` : option.label}
        </span>
      ))}
    </span>
  );
}

interface ReviewRowProps {
  label: string;
  value: ReactNode;
  onEdit: () => void;
}

function ReviewRow({ label, value, onEdit }: ReviewRowProps) {
  const isEmpty =
    value === undefined || value === null || value === '' || value === false;

  return (
    <div className="flex items-center gap-4 py-3">
      <dt className="w-40 shrink-0 text-xs font-medium tracking-widest text-ink-muted uppercase">
        {label}
      </dt>
      <dd className={isEmpty ? 'flex-1 text-ink-muted' : 'flex-1 text-ink'}>
        {isEmpty ? NOT_SET : value}
      </dd>
      <Button
        variant="outline"
        size="sm"
        className="rounded-pill"
        aria-label={`Edit ${label}`}
        onClick={onEdit}
      >
        Edit
      </Button>
    </div>
  );
}
