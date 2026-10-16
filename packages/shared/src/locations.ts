import { z } from 'zod';

import { lookupLimitSchema, lookupSearchSchema } from './lookup-query';

export interface Location {
  id: string;
  countryCode: string | null;
  countryName: string | null;
  stateName: string | null;
  city: string | null;
  postalCode: string | null;
}

export const locationSchema: z.ZodType<Location> = z.object({
  id: z.uuid(),
  countryCode: z.string().nullable(),
  countryName: z.string().nullable(),
  stateName: z.string().nullable(),
  city: z.string().nullable(),
  postalCode: z.string().nullable(),
});

export const locationListSchema: z.ZodType<Location[]> =
  z.array(locationSchema);

export interface LocationsQuery {
  /** Matches country, state or city name. */
  search?: string | undefined;
  countryCode?: string | undefined;
  state?: string | undefined;
  limit: number;
}

export const locationsQuerySchema: z.ZodType<LocationsQuery> = z.object({
  search: lookupSearchSchema,
  countryCode: z.string().trim().length(2).toUpperCase().optional(),
  state: z.string().trim().min(1).optional(),
  limit: lookupLimitSchema,
});
