import { locationsQuerySchema } from '@job-scraper/shared';
import type { NextRequest } from 'next/server';

import { searchLocations } from '@/lib/lookups/api';
import { toLocationOption } from '@/lib/lookups/options';
import {
  LOOKUP_SEARCH_LIMIT,
  type LookupSearchResult,
} from '@/lib/lookups/types';

/** Search-as-you-type for locations: `GET /api/lookups/locations?search=ber`. */
export async function GET(request: NextRequest): Promise<Response> {
  const parsed = locationsQuerySchema.safeParse({
    search: request.nextUrl.searchParams.get('search') ?? undefined,
    limit: LOOKUP_SEARCH_LIMIT,
  });
  if (!parsed.success || parsed.data.search === undefined) {
    return Response.json({ options: [] } satisfies LookupSearchResult);
  }

  try {
    const locations = await searchLocations(parsed.data.search);
    return Response.json({
      options: locations.map(toLocationOption),
    } satisfies LookupSearchResult);
  } catch {
    return Response.json(
      {
        error: 'Could not search locations. Please try again.',
      } satisfies LookupSearchResult,
      { status: 502 },
    );
  }
}
