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

* Material Design 3 uses a confirm action (Save) and a dismiss action
  (Cancel) for edits that need several fields, like a calendar entry. Each
  profile section is that kind of edit.
* Microsoft's settings guidelines say a single setting (a toggle, a
  dropdown) should apply at once, without a confirm button. That is why
  instant save for toggles was considered; it was rejected to keep one save
  model on the page.
* Apple HIG asks to warn before closing a view when user input could be
  lost. This is the unsaved-changes warning in Consequences.
* WCAG 2.2 SC 3.3.4 (Error Prevention) does not require Save/Cancel for
  simple edits of user data; it targets bigger loss, like deleting a
  record. Save/Cancel still lets users check an edit before it is stored,
  which fits the intent of the rule.
* The backend PATCH already accepts partial updates, so a per-section save
  needs no backend change.
* One request per section keeps list updates in order and validation in one
  place.
* The profile is short and has no long text, so the main benefit of
  auto-save (not losing long work) is small here.

## Consequences

* Leaving the page with an open card loses the draft. To prevent this, the
  page listens to the browser's `beforeunload` event while a card has
  unsaved changes.
  * What it is: a built-in browser event that fires just before the page
    is unloaded (tab closed, page reloaded, new URL typed, leaving the
    site). If the handler calls `event.preventDefault()`, the browser shows
    its own "Leave site? Changes you made may not be saved." dialog. The
    text cannot be changed.
  * Why: it is the standard way to stop users from losing an edit by
    accident, and it needs no dependency.
  * MVP: yes. It is easy to implement: one `useEffect` that adds the
    listener while a card is dirty and removes it on Save or Cancel.
  * Reference: <https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event>
* `beforeunload` only fires when the tab closes or reloads. Clicking an
  in-app link (Next.js client navigation) does not trigger it, so the draft
  is lost without a warning unless the app checks for an open card first.
  Not in the MVP: the App Router has no built-in way to block navigation,
  so this needs a custom guard on the nav links. Add it later if users
  lose edits this way.
* Changing a single toggle takes three clicks (Edit, toggle, Save) instead
  of one. Accepted to keep one save model on the page.
* Save must not clear the headline or location, otherwise
  `onboardingCompleted` becomes false.
* Save and error status messages use `aria-live` (WCAG 4.1.3).
* No new dependency. State stays local to each card.

## Notes

* Wireframe: `doc/wireframes/profile-wireframe.md`.
* Endpoint: `PATCH /users/me/profile` in
  `apps/backend/src/users/user-profile.controller.ts`.
* Sources:
  * Material Design 3, Dialogs:
    <https://m3.material.io/components/dialogs/guidelines>
  * Microsoft, Guidelines for app settings:
    <https://learn.microsoft.com/en-us/windows/apps/design/app-settings/guidelines-for-app-settings>
  * Apple HIG, Modality:
    <https://developer.apple.com/design/human-interface-guidelines/modality>
  * WCAG 2.2, SC 3.3.4 Error Prevention:
    <https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html>
  * WCAG 2.2, SC 4.1.3 Status Messages:
    <https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html>

