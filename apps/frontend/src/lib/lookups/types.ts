/** A lookup value as a filter shows it: slug or id, plus a readable label. */
export interface LookupOption {
  value: string;
  label: string;
}

/** What a lookup search returns. */
export type LookupSearchResult =
  { options: LookupOption[] } | { error: string };

export const LOOKUP_SEARCH_LIMIT = 10;
