'use client';

import type { Industry } from '@job-scraper/shared';
import { type ReactNode, useEffect, useRef } from 'react';

import { LogoMark } from '@/components/brand/logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { OnboardingCard } from '../onboarding-card';
import type { Answers, Step } from '../onboarding-state';
import { SubmitOnboardingButton } from '../submit-onboarding-button';
import { EMPLOYMENT_LABELS } from './employment-step';
import { SENIORITY_LABELS } from './seniority-step';
import { WORK_SETUP_LABELS } from './work-setup-step';

const NOT_SET = 'Not set';

interface ReviewStepProps {
  answers: Answers;
  industries: Industry[];
  onEdit: (step: Step) => void;
  onBack: () => void;
}

export function ReviewStep({
  answers,
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
          value={answers.locationId}
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
            EMPLOYMENT_LABELS[preferences.employmentType]
          }
          onEdit={() => {
            onEdit('employment');
          }}
        />
        <ReviewRow
          label="Work setup"
          value={
            preferences?.remotePreference &&
            WORK_SETUP_LABELS[preferences.remotePreference]
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
            value={answers.preferencesLocationIds?.join(', ')}
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
          label="Industries"
          value={
            industries.length > 0 && (
              <span className="flex flex-wrap gap-2">
                {industries.map((industry, index) => (
                  <span
                    key={industry.slug}
                    className="rounded-chip bg-ink px-3 py-1 text-sm font-medium text-surface"
                  >
                    {index + 1}. {industry.name}
                  </span>
                ))}
              </span>
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
