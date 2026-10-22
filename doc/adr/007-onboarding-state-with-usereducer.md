# ADR-007: Onboarding flow state with `useReducer`

* Status: accepted

## Decision

The onboarding flow (`apps/frontend/src/app/onboarding`) keeps its state in
one client component with React `useReducer`. The state holds the current
step, the answers and a `returnToReview` flag. The answers use the shared
`UpdateUserProfileRequest` type and are sent once, on Submit, through the
`submitOnboarding` server action (`PATCH /users/me/profile`).

The reducer and its types live in plain TypeScript
(`components/onboarding/onboarding-state.ts`); the screens only dispatch
actions (`answer`, `next`, `back`, `goTo`).

## Options Considered

* `useState` per value: simple, but rules such as "Edit from Review, then
  return to Review" would be spread over every screen.
* React Context: not needed while the screens are one level below the flow
  component.
* Global store (Zustand, Redux): the state belongs to one page; a new
  dependency for it is not justified.
* react-hook-form: not in the repo; suits one large form better than one
  question per screen. Validation already uses the shared zod schemas.
* XState: the flow is linear with one branch (relocation); a reducer is
  already a small state machine.
* Saving after every step: more requests and error handling; the wireframe
  saves on Submit.

## Rationale

Several values change together (step, answers, `returnToReview`), and the next
state depends on the current one. A reducer keeps all flow rules in one pure
function that is typed by a discriminated union of actions. The visible steps
are derived from the answers (`getSteps`), so the relocation question and the
progress count need no extra state. It is built into React and adds no
dependency.

## Consequences

* A page reload during onboarding loses the answers. Acceptable for a flow of
  about one minute; `sessionStorage` can be added later if needed.
* The browser Back button leaves the page instead of going to the previous
  question. Moving the step into the URL (`?step=`) is possible later.
* Onboarding is only marked done when the backend has a headline and a
  location (`onboardingCompleted`); skipped answers stay unchanged.

## Notes

* Flow: `doc/onboarding-wireframe.md`.
* After login, users go to `/onboarding`; finished users are redirected to
  `/profile`.
