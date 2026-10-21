import type {
  UpdateUserProfileRequest,
  UserProfile,
} from '@job-scraper/shared';

export type Step =
  | 'welcome'
  | 'essentials'
  | 'seniority'
  | 'employment'
  | 'workSetup'
  | 'relocate'
  | 'preferenceLocations'
  | 'years'
  | 'skills'
  | 'industries'
  | 'review';

const ALL_STEPS: Step[] = [
  'welcome',
  'essentials',
  'seniority',
  'employment',
  'workSetup',
  'relocate',
  'preferenceLocations',
  'years',
  'skills',
  'industries',
  'review',
];

// The answers have exactly the shape we send to PATCH /users/me/profile
export type Answers = UpdateUserProfileRequest;

export interface OnboardingState {
  step: Step;
  answers: Answers;
  returnToReview: boolean;
}

export type OnboardingAction =
  | { type: 'answer'; patch: Answers }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'goTo'; step: Step };

//the user actually sees (Q6b only if they want to relocate)
export function getSteps(answers: Answers): Step[] {
  return ALL_STEPS.filter(
    (step) =>
      step !== 'preferenceLocations' ||
      answers.preferences?.willingToRelocate === true,
  );
}

// Starting state, pre-filled from the saved profile
export function createInitialState(profile: UserProfile): OnboardingState {
  return {
    step: 'welcome',
    returnToReview: false,
    answers: {
      headline: profile.headline,
      locationId: profile.location?.id ?? null,
      seniority: profile.seniority,
      yearsExperience: profile.yearsExperience,
    },
  };
}

// The reducer: (current state, what happened) → new state as it is multi states not  a simple state
export function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction,
): OnboardingState {
  switch (action.type) {
    case 'answer':
      return { ...state, answers: mergeAnswers(state.answers, action.patch) };

    case 'next': {
      if (state.returnToReview) {
        return { ...state, step: 'review', returnToReview: false };
      }
      const steps = getSteps(state.answers);
      const next = steps[steps.indexOf(state.step) + 1];
      return { ...state, step: next ?? 'review' };
    }

    case 'back': {
      if (state.returnToReview) {
        return { ...state, step: 'review', returnToReview: false };
      }
      const steps = getSteps(state.answers);
      const previous = steps[steps.indexOf(state.step) - 1];
      return { ...state, step: previous ?? 'welcome' };
    }

    case 'goTo':
      return {
        ...state,
        step: action.step,
        returnToReview: action.step !== 'review',
      };
  }
}

// merge the state
function mergeAnswers(answers: Answers, patch: Answers): Answers {
  const merged: Answers = { ...answers, ...patch };
  if (patch.preferences) {
    merged.preferences = { ...answers.preferences, ...patch.preferences };
  }
  // "No" to relocating → drop the preferences Locations chosen before
  if (patch.preferences?.willingToRelocate === false) {
    merged.preferencesLocationIds = [];
  }
  return merged;
}
