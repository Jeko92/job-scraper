import { z } from 'zod';

import targetCitiesJson from '../../common/utils/target-cities.json' with { type: 'json' };

const targetCitiesSchema = z.array(
  z.object({
    city: z.string().trim().min(1),
    postal_code: z.string(),
    wikidata_id: z.string().regex(/^Q\d+$/),
    companyenrich_name: z.string().trim().min(1).optional(),
  }),
);

export type TargetCity = z.infer<typeof targetCitiesSchema>[number];

export const targetCities: TargetCity[] =
  targetCitiesSchema.parse(targetCitiesJson);
