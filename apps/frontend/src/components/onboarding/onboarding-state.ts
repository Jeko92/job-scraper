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
  | 'experienceYears'
  | 'skills'
  | 'industries'
  | 'review';

export const STEPS: Step[] = [
  'welcome',
  'essentials',
  'seniority',
  'employment',
  'workSetup',
  'relocate',
  'experienceYears',
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
  | { type: 'goTo'; step: Step }
  | { type: 'jumpTo'; step: Step };

// Question number shown before the title ("3 →"). Welcome is no question but
// Essentials holds two (Q1 and Q2), so the position + 1 matches the wireframe.
export function getQuestionNumber(step: Step): number {
  return STEPS.indexOf(step) + 1;
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
      const next = STEPS[STEPS.indexOf(state.step) + 1];
      return { ...state, step: next ?? 'review' };
    }

    case 'back': {
      if (state.returnToReview) {
        return { ...state, step: 'review', returnToReview: false };
      }
      const previous = STEPS[STEPS.indexOf(state.step) - 1];
      return { ...state, step: previous ?? 'welcome' };
    }

    case 'goTo':
      return {
        ...state,
        step: action.step,
        returnToReview: action.step !== 'review',
      };

    // Stepper: continue the flow from there, no detour back to Review.
    case 'jumpTo':
      return { ...state, step: action.step, returnToReview: false };
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
