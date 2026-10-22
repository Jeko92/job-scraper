'use client';

import type { Industry, UserProfile } from '@job-scraper/shared';
import { type Dispatch, useReducer, useState } from 'react';

import { Button } from '@/components/ui/button';

import {
  createInitialState,
  getQuestionNumber,
  type OnboardingAction,
  onboardingReducer,
  type OnboardingState,
  STEPS,
} from './onboarding-state';
import { OnboardingStepper } from './onboarding-stepper';
import { EmploymentStep } from './steps/employment-step';
import { EssentialsStep } from './steps/essentials-step';
import { ExperienceYearsStep } from './steps/experience-years-step';
import { IndustriesStep } from './steps/industries-step';
import { RelocateStep } from './steps/relocate-step';
import { ReviewStep } from './steps/review-step';
import { SeniorityStep } from './steps/seniority-step';
import { WelcomeStep } from './steps/welcome-step';
import { WorkSetupStep } from './steps/work-setup-step';

interface OnboardingFlowProps {
  profile: UserProfile;
}

export function OnboardingFlow({ profile }: OnboardingFlowProps) {
  const [state, dispatch] = useReducer(
    onboardingReducer,
    profile,
    createInitialState,
  );
  // The answers only hold slugs; and chips  need the names to display.
  const [industries, setIndustries] = useState<Industry[]>(() =>
    profile.industries.map(({ id, name, slug }) => ({ id, name, slug })),
  );
  const number = getQuestionNumber(state.step);

  return (
    <div className="w-full max-w-2xl space-y-6">
      {state.step !== 'welcome' && (
        <OnboardingStepper
          step={state.step}
          onJump={(step) => {
            dispatch({ type: 'jumpTo', step });
          }}
        />
      )}
      {renderStep()}
    </div>
  );

  function renderStep() {
    switch (state.step) {
      case 'welcome':
        return (
          <WelcomeStep
            firstName={profile.firstName}
            onStart={() => {
              dispatch({ type: 'next' });
            }}
          />
        );
      case 'essentials':
        return (
          <EssentialsStep
            headline={state.answers.headline}
            locationId={state.answers.locationId}
            dispatch={dispatch}
          />
        );
      case 'seniority':
        return (
          <SeniorityStep
            number={number}
            value={state.answers.seniority}
            dispatch={dispatch}
          />
        );
      case 'employment':
        return (
          <EmploymentStep
            number={number}
            value={state.answers.preferences?.employmentType}
            dispatch={dispatch}
          />
        );
      case 'workSetup':
        return (
          <WorkSetupStep
            number={number}
            value={state.answers.preferences?.remotePreference}
            dispatch={dispatch}
          />
        );
      case 'relocate':
        return (
          <RelocateStep
            number={number}
            value={state.answers.preferences?.willingToRelocate}
            locationIds={state.answers.preferencesLocationIds}
            dispatch={dispatch}
          />
        );
      case 'experienceYears':
        return (
          <ExperienceYearsStep
            number={number}
            value={state.answers.yearsExperience}
            dispatch={dispatch}
          />
        );
      case 'industries':
        return (
          <IndustriesStep
            number={number}
            selected={industries}
            onChange={(next) => {
              setIndustries(next);
              dispatch({
                type: 'answer',
                patch: { industries: next.map((industry) => industry.slug) },
              });
            }}
            onNext={() => {
              dispatch({ type: 'next' });
            }}
            onBack={() => {
              dispatch({ type: 'back' });
            }}
          />
        );
      case 'review':
        return (
          <ReviewStep
            answers={state.answers}
            industries={industries}
            onEdit={(step) => {
              dispatch({ type: 'goTo', step });
            }}
            onBack={() => {
              dispatch({ type: 'back' });
            }}
          />
        );
      default:
        return <DebugView state={state} dispatch={dispatch} />;
    }
  }
}

// Temporary: shown DebugView.
interface DebugViewProps {
  state: OnboardingState;
  dispatch: Dispatch<OnboardingAction>;
}

function DebugView({ state, dispatch }: DebugViewProps) {
  const position = STEPS.indexOf(state.step) + 1;

  return (
    <div className="w-full max-w-2xl space-y-4">
      <p>
        Step {position} of {STEPS.length}: <strong>{state.step}</strong>
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            dispatch({ type: 'back' });
          }}
        >
          Back
        </Button>
        <Button
          onClick={() => {
            dispatch({ type: 'next' });
          }}
        >
          Next
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            dispatch({
              type: 'answer',
              patch: { preferences: { willingToRelocate: true } },
            });
          }}
        >
          Relocate: yes
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            dispatch({ type: 'goTo', step: 'seniority' });
          }}
        >
          Edit seniority
        </Button>
      </div>

      <pre className="rounded-card bg-surface p-4 text-xs">
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  );
}
