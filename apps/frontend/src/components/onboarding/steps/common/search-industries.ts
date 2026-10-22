'use server';

import { type Industry, industryListSchema } from '@job-scraper/shared';
import { cookies } from 'next/headers';

import { AUTH_COOKIE } from '@/lib/auth/cookie';
import { getFromBackend } from '@/lib/backend';

const SEARCH_LIMIT = 10;

// Autocomplete lookup: any failure just means "no results []".
export async function searchIndustries(search: string): Promise<Industry[]> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (token === undefined) {
    return [];
  }
  //Get 10 for the suggestions
  const params = new URLSearchParams({ limit: String(SEARCH_LIMIT) });
  const text = search.trim();
  if (text !== '') {
    params.set('search', text);
  }

  try {
    const response = await getFromBackend(
      `/industries?${params.toString()}`,
      token,
    );
    if (!response.ok) {
      return [];
    }
    const industries = industryListSchema.safeParse(await response.json());
    return industries.success ? industries.data : [];
  } catch {
    return [];
  }
}
