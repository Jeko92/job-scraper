# ADR-008: Profile page edits one section at a time with explicit Save

* Status: proposed

## Decision

The profile page (`apps/frontend/src/app/profile`) shows the profile read-only,
split into section cards:

* Basic info: name, headline, seniority, years of experience, location
* Skills
* Industries
* Job preferences: work setup, employment type, salary, relocation and
  preferred locations

Each card has an **Edit** button. Edit switches only that card into a form
with **Save** and **Cancel**. Only one card can be in edit mode at a time.
Save validates the section with the shared zod schema and sends one
`PATCH /users/me/profile` that contains only that section's fields. Cancel
drops the draft. The card shows the saved values from the response.

The form fields reuse the onboarding step components where they fit.

## Options Considered

* Auto-save on blur: the user never forgets to save. But a stray click
  commits an edit, there is no Cancel, and every field needs its own
  "Saving / Saved / Failed" state. Skills, industries and preferred
  locations replace the whole list on every PATCH, so two quick requests can
  finish out of order and bring back a removed item. A field can be valid
  alone but leave the profile incomplete (empty headline or location).
* One form for the whole page with one Save button: simple, but the page is
  always in edit mode and one invalid field blocks saving everything.
* Instant save for toggles only (e.g. "willing to relocate"): mixing two
  save models in one page confuses users, so all sections use the same
  model.

## Rationale

* Platform guidelines (Material, Apple HIG, Fluent) apply changes instantly
  for single settings. Forms with several related fields use an explicit
  Save/Done.
* WCAG 2.2 SC 3.3.4 (Error Prevention) asks that changes to user data are
  reversible, checked or confirmed. Save/Cancel meets this without an extra
  undo feature.
* The backend PATCH already accepts partial updates, so a per-section save
  needs no backend change.
* One request per section keeps list updates in order and validation in one
  place.
* The profile is short and has no long text, so the main benefit of
  auto-save (not losing long work) is small here.

## Consequences

* Leaving the page with an open card loses the draft. Warn the user with
  `beforeunload` while a card has unsaved changes.
* Save must not clear the headline or location, otherwise
  `onboardingCompleted` becomes false.
* Save and error status messages use `aria-live` (WCAG 4.1.3).
* No new dependency. State stays local to each card.

## Notes

* Wireframe: `doc/wireframes/profile-wireframe.md`.
* Endpoint: `PATCH /users/me/profile` in
  `apps/backend/src/users/user-profile.controller.ts`.

