import { industriesQuerySchema } from '@job-scraper/shared';
import type { NextRequest } from 'next/server';

import { searchIndustries } from '@/lib/lookups/api';
import { toIndustryOption } from '@/lib/lookups/options';
import {
  LOOKUP_SEARCH_LIMIT,
  type LookupSearchResult,
} from '@/lib/lookups/types';

export async function GET(request: NextRequest): Promise<Response> {
  // An empty search counts as none, so the first industries come back.
  const search = request.nextUrl.searchParams.get('search')?.trim() ?? '';
  const parsed = industriesQuerySchema.safeParse({
    search: search === '' ? undefined : search,
    limit: LOOKUP_SEARCH_LIMIT,
  });
  if (!parsed.success) {
    return Response.json({ options: [] } satisfies LookupSearchResult);
  }

  try {
    const industries = await searchIndustries(parsed.data.search);
    return Response.json({
      options: industries.map(toIndustryOption),
    } satisfies LookupSearchResult);
  } catch {
    return Response.json(
      {
        error: 'Could not search industries. Please try again.',
      } satisfies LookupSearchResult,
      { status: 502 },
    );
  }
}
