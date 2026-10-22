import type { Location, Skill } from '@job-scraper/shared';

import type { LookupOption } from './types';

export function toSkillOption(skill: Skill): LookupOption {
  return { value: skill.slug, label: skill.name };
}

/** "Berlin, DE"; a region or country when there is no city. */
export function toLocationOption(location: Location): LookupOption {
  const label =
    location.city !== null
      ? [location.city, location.countryCode].filter(Boolean).join(', ')
      : (location.stateName ?? location.countryName ?? 'Unknown location');
  return { value: location.id, label };
}
