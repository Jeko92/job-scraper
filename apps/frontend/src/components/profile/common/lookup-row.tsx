'use client';

import type { UpdateUserProfileRequest } from '@job-scraper/shared';

import { LookupField } from '@/components/lookups/lookup-field';
import type { LookupOption, LookupSearchResult } from '@/lib/lookups/types';

import { ChipList } from './chip-list';
import { EditableRow, type RowControl } from './editable-row';

interface LookupRowProps extends RowControl {
  label: string;
  addLabel: string;
  /** Label of the search field in edit mode. */
  searchLabel: string;
  placeholder: string;
  options: LookupOption[];
  max: number;
  search: (text: string) => Promise<LookupSearchResult>;
  /** The PATCH body for the chosen values (slugs or ids). */
  buildRequest: (values: string[]) => UpdateUserProfileRequest;
  /** The order is the priority: "1. Finance", "2. Software". */
  numbered?: boolean;
}

// A list row (skills, industries, places): chips in view mode, a lookup
// field in edit mode.
export function LookupRow({
  searchLabel,
  placeholder,
  options,
  max,
  search,
  buildRequest,
  numbered = false,
  ...row
}: LookupRowProps) {
  return (
    <EditableRow<LookupOption[]>
      {...row}
      // null when empty, so the row shows "Not set".
      value={
        options.length > 0 ? (
          <ChipList
            numbered={numbered}
            labels={options.map((option) => option.label)}
          />
        ) : null
      }
      initialDraft={options}
      renderEditor={(draft, setDraft) => (
        <LookupField
          label={searchLabel}
          placeholder={placeholder}
          selected={draft}
          max={max}
          numbered={numbered}
          search={search}
          onChange={setDraft}
        />
      )}
      buildRequest={(draft) =>
        buildRequest(draft.map((option) => option.value))
      }
    />
  );
}
