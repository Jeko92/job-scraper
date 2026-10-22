'use server';

import { locationsQuerySchema, skillsQuerySchema } from '@job-scraper/shared';

import { searchLocations, searchSkills } from './api';
import { toLocationOption, toSkillOption } from './options';
import { LOOKUP_SEARCH_LIMIT, type LookupSearchResult } from './types';

export async function searchSkillOptions(
  search: string,
): Promise<LookupSearchResult> {
  const parsed = skillsQuerySchema.safeParse({
    search,
    limit: LOOKUP_SEARCH_LIMIT,
  });
  if (!parsed.success || parsed.data.search === undefined) {
    return { options: [] };
  }

  try {
    const skills = await searchSkills(parsed.data.search);
    return { options: skills.map(toSkillOption) };
  } catch {
    return { error: 'Could not search skills. Please try again.' };
  }
}

export async function searchLocationOptions(
  search: string,
): Promise<LookupSearchResult> {
  const parsed = locationsQuerySchema.safeParse({
    search,
    limit: LOOKUP_SEARCH_LIMIT,
  });
  if (!parsed.success || parsed.data.search === undefined) {
    return { options: [] };
  }

  try {
    const locations = await searchLocations(parsed.data.search);
    return { options: locations.map(toLocationOption) };
  } catch {
    return { error: 'Could not search locations. Please try again.' };
  }
}
