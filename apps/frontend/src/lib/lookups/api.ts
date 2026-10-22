import {
  type Location,
  locationListSchema,
  locationSchema,
  type Skill,
  skillListSchema,
  skillSchema,
} from '@job-scraper/shared';

import { readAuthToken } from '@/lib/auth/auth-token';
import { getFromBackend } from '@/lib/backend';

import { LOOKUP_SEARCH_LIMIT } from './types';

/** Skills by slug, e.g. for chip labels; unknown slugs are left out. */
export async function fetchSkillsBySlugs(
  slugs: string[] | undefined,
): Promise<Skill[]> {
  if (slugs === undefined || slugs.length === 0) {
    return [];
  }
  const token = await requireToken();
  const skills = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const response = await getFromBackend(
          `/skills/${encodeURIComponent(slug)}`,
          token,
        );
        if (!response.ok) {
          return null;
        }
        const skill = skillSchema.safeParse(await response.json());
        return skill.success ? skill.data : null;
      } catch {
        return null;
      }
    }),
  );
  return skills.filter((skill) => skill !== null);
}

/** Throws when not logged in, or when the backend fails. */
export async function searchSkills(search: string): Promise<Skill[]> {
  const token = await requireToken();
  const params = new URLSearchParams({
    search,
    limit: String(LOOKUP_SEARCH_LIMIT),
  });
  const response = await getFromBackend(`/skills?${params.toString()}`, token);
  if (!response.ok) {
    throw new Error(
      `GET /skills failed with status ${String(response.status)}`,
    );
  }
  return skillListSchema.parse(await response.json());
}

/** Locations by id, e.g. for chip labels; unknown ids are left out. */
export async function fetchLocationsByIds(
  ids: string[] | undefined,
): Promise<Location[]> {
  if (ids === undefined || ids.length === 0) {
    return [];
  }
  const token = await requireToken();
  const locations = await Promise.all(
    ids.map(async (id) => {
      try {
        const response = await getFromBackend(
          `/locations/${encodeURIComponent(id)}`,
          token,
        );
        if (!response.ok) {
          return null;
        }
        const location = locationSchema.safeParse(await response.json());
        return location.success ? location.data : null;
      } catch {
        return null;
      }
    }),
  );
  return locations.filter((location) => location !== null);
}

/** Throws when not logged in, or when the backend fails. */
export async function searchLocations(search: string): Promise<Location[]> {
  const token = await requireToken();
  const params = new URLSearchParams({
    search,
    limit: String(LOOKUP_SEARCH_LIMIT),
  });
  const response = await getFromBackend(
    `/locations?${params.toString()}`,
    token,
  );
  if (!response.ok) {
    throw new Error(
      `GET /locations failed with status ${String(response.status)}`,
    );
  }
  return locationListSchema.parse(await response.json());
}

async function requireToken(): Promise<string> {
  const token = await readAuthToken();
  if (token === undefined) {
    throw new Error('Not logged in');
  }
  return token;
}
