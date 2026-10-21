import { type Skill, skillListSchema, skillSchema } from '@job-scraper/shared';

import { readAuthToken } from '@/lib/auth/auth-token';
import { getFromBackend } from '@/lib/backend';

/** A lookup value as a filter shows it: slug or id, plus a readable label. */
export interface LookupOption {
  value: string;
  label: string;
}

export const LOOKUP_SEARCH_LIMIT = 10;

/** Names for the selected skill slugs; unknown slugs are left out. */
export async function fetchJobSkills(
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

async function requireToken(): Promise<string> {
  const token = await readAuthToken();
  if (token === undefined) {
    throw new Error('Not logged in');
  }
  return token;
}
