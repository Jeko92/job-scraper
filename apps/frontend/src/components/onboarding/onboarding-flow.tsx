'use client';

import type { UserProfile } from '@job-scraper/shared';
import { useReducer, useState } from 'react';

import {
  toIndustryOption,
  toLocationOption,
  toSkillOption,
} from '@/lib/lookups/options';
import type { LookupOption } from '@/lib/lookups/types';

import {
  createInitialState,
  getQuestionNumber,
  onboardingReducer,
} from './onboarding-state';
import { OnboardingStepper } from './onboarding-stepper';
import { EmploymentStep } from './steps/employment-step';
import { EssentialsStep } from './steps/essentials-step';
import { ExperienceYearsStep } from './steps/experience-years-step';
import { IndustriesStep } from './steps/industries-step';
import { RelocateStep } from './steps/relocate-step';
import { ReviewStep } from './steps/review-step';
import { SeniorityStep } from './steps/seniority-step';
import { SkillsStep } from './steps/skills-step';
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
  // The answers only hold slugs and ids; the chips need the names.
  const [industries, setIndustries] = useState<LookupOption[]>(() =>
    profile.industries.map(toIndustryOption),
  );
  const [location, setLocation] = useState<LookupOption | null>(() =>
    profile.location ? toLocationOption(profile.location) : null,
  );
  const [relocationPlaces, setRelocationPlaces] = useState<LookupOption[]>(() =>
    profile.preferencesLocations.map(toLocationOption),
  );
  // Levels are skipped for now; only the slugs are saved.
  const [skills, setSkills] = useState<LookupOption[]>(() =>
    profile.skills.map(toSkillOption),
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
            location={location}
            onLocationChange={(next) => {
              setLocation(next);
              dispatch({
                type: 'answer',
                patch: { locationId: next?.value ?? null },
              });
            }}
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
            places={relocationPlaces}
            onPlacesChange={(next) => {
              setRelocationPlaces(next);
              dispatch({
                type: 'answer',
                patch: {
                  preferencesLocationIds: next.map((place) => place.value),
                },
              });
            }}
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
      case 'skills':
        return (
          <SkillsStep
            number={number}
            selected={skills}
            onChange={(next) => {
              setSkills(next);
              dispatch({
                type: 'answer',
                patch: { skills: next.map((skill) => ({ slug: skill.value })) },
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
      case 'industries':
        return (
          <IndustriesStep
            number={number}
            selected={industries}
            onChange={(next) => {
              setIndustries(next);
              dispatch({
                type: 'answer',
                patch: { industries: next.map((industry) => industry.value) },
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
    }
  }
}
