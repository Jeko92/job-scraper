'use client';

import type { UserProfile } from '@job-scraper/shared';
import { type Dispatch, useReducer } from 'react';

import { Button } from '@/components/ui/button';

import {
  createInitialState,
  getSteps,
  type OnboardingAction,
  onboardingReducer,
  type OnboardingState,
} from './onboarding-state';
import { EmploymentStep } from './steps/employment-step';
import { EssentialsStep } from './steps/essentials-step';
import { ExperienceYearsStep } from './steps/experience-years-step';
import { PreferenceLocationsStep } from './steps/preference-locations-step';
import { RelocateStep } from './steps/relocate-step';
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
        <SeniorityStep value={state.answers.seniority} dispatch={dispatch} />
      );
    case 'employment':
      return (
        <EmploymentStep
          value={state.answers.preferences?.employmentType}
          dispatch={dispatch}
        />
      );
    case 'workSetup':
      return (
        <WorkSetupStep
          value={state.answers.preferences?.remotePreference}
          dispatch={dispatch}
        />
      );
    case 'relocate':
      return (
        <RelocateStep
          value={state.answers.preferences?.willingToRelocate}
          dispatch={dispatch}
        />
      );
    case 'preferenceLocations':
      return (
        <PreferenceLocationsStep
          locationIds={state.answers.preferencesLocationIds}
          dispatch={dispatch}
        />
      );
    case 'experienceYears':
      return (
        <ExperienceYearsStep
          value={state.answers.yearsExperience}
          dispatch={dispatch}
        />
      );
    default:
      return <DebugView state={state} dispatch={dispatch} />;
  }
}

// Temporary: shown DebugView.
interface DebugViewProps {
  state: OnboardingState;
  dispatch: Dispatch<OnboardingAction>;
}

function DebugView({ state, dispatch }: DebugViewProps) {
  const steps = getSteps(state.answers);
  const position = steps.indexOf(state.step) + 1;

  return (
    <div className="w-full max-w-2xl space-y-4">
      <p>
        Step {position} of {steps.length}: <strong>{state.step}</strong>
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
