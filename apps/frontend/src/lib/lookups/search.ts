import type { LookupSearchResult } from './types';

const SKILLS_SEARCH_PATH = '/api/lookups/skills';
const LOCATIONS_SEARCH_PATH = '/api/lookups/locations';
const INDUSTRIES_SEARCH_PATH = '/api/lookups/industries';

/** For `LookupFilter`'s `search` prop; runs in the browser. */
export function searchSkillOptions(text: string): Promise<LookupSearchResult> {
  return searchLookup(SKILLS_SEARCH_PATH, text, 'skills');
}

/** For `LookupFilter`'s `search` prop; runs in the browser. */
export function searchLocationOptions(
  text: string,
): Promise<LookupSearchResult> {
  return searchLookup(LOCATIONS_SEARCH_PATH, text, 'locations');
}

/** For `LookupFilter`'s `search` prop; runs in the browser. An empty text
 * returns suggestions. */
export function searchIndustryOptions(
  text: string,
): Promise<LookupSearchResult> {
  return searchLookup(INDUSTRIES_SEARCH_PATH, text, 'industries');
}

async function searchLookup(
  path: string,
  text: string,
  what: string,
): Promise<LookupSearchResult> {
  try {
    const params = new URLSearchParams({ search: text });
    const response = await fetch(`${path}?${params.toString()}`);
    return (await response.json()) as LookupSearchResult;
  } catch {
    return { error: `Could not search ${what}. Please try again.` };
  }
}
