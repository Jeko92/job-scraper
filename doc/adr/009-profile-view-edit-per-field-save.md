# ADR-009: Profile page edits one field at a time, in place

* Status: accepted
* Supersedes: ADR-008

## Decision

The profile page shows the profile read-only in section cards (basic info,
job preferences, skills, industries). Each row (label and value) has an edit
button (✎). It turns only that value into its field in the same place (text
box, dropdown or search) with ✓ (save) and ✕ (cancel).

* One row is open at a time.
* ✓ validates the row and sends one `PATCH /users/me/profile` with only that
  field. Without a change it just closes. A green check shows for 3 seconds.
* ✕ drops the draft.

## Options Considered

* Edit one section at a time (Edit → form with Save / Cancel): built first,
  but it looked heavy. The form had a different layout than the rows, and
  the card grew and jumped when it opened.
* Auto-save on blur: a stray click saves, there is no Cancel, and quick
  requests for lists (skills, industries, locations) can overwrite each
  other.

## Rationale

* Only the value changes; nothing else on the page moves.
* Users usually change one thing at a time.
* ✓ / ✕ keeps stray clicks and typos from being saved (WCAG 3.3.4 intent).
* The backend PATCH already accepts partial updates.
* One row at a time means one request at a time, so lists cannot overwrite
  each other.

## Consequences

* One small PATCH per saved field.
* While a row is open, `beforeunload` warns before closing or reloading the
  tab. In-app links do not fire it; a guard for them is not in the MVP.
* A toggle takes three clicks (✎, toggle, ✓).
* Role and location cannot be cleared (checked in the frontend only, for
  now). An empty first or last name shows an error (e.g. "First name is
  required.").
* "Saved" and errors are announced to screen readers (WCAG 4.1.3).

## Notes

* Wireframe: `doc/wireframes/profile-wireframe.md`
* Code: `apps/frontend/src/components/profile/`
* Sources:
  [WCAG 3.3.4](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html),
  [WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html),
  [beforeunload (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event)
