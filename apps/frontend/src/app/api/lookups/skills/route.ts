import { skillsQuerySchema } from '@job-scraper/shared';
import type { NextRequest } from 'next/server';

import { searchSkills } from '@/lib/lookups/api';
import { toSkillOption } from '@/lib/lookups/options';
import {
  LOOKUP_SEARCH_LIMIT,
  type LookupSearchResult,
} from '@/lib/lookups/types';

/** Search-as-you-type for skills: `GET /api/lookups/skills?search=rea`. */
export async function GET(request: NextRequest): Promise<Response> {
  const parsed = skillsQuerySchema.safeParse({
    search: request.nextUrl.searchParams.get('search') ?? undefined,
    limit: LOOKUP_SEARCH_LIMIT,
  });
  if (!parsed.success || parsed.data.search === undefined) {
    return Response.json({ options: [] } satisfies LookupSearchResult);
  }

  try {
    const skills = await searchSkills(parsed.data.search);
    return Response.json({
      options: skills.map(toSkillOption),
    } satisfies LookupSearchResult);
  } catch {
    return Response.json(
      {
        error: 'Could not search skills. Please try again.',
      } satisfies LookupSearchResult,
      { status: 502 },
    );
  }
}
