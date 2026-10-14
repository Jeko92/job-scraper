import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../../../config/env.js';
import {
  type CompanyCandidate,
  textOrNull,
  toDomain,
} from '../../normalized-company.js';
import { SourceAdapter } from '../source-adapter.js';
import { targetCities } from '../target-cities.js';
import {
  type WikidataBinding,
  wikidataResponseSchema,
} from './wikidata-response.js';

const SOURCE = 'wikidata';
const INDUSTRY = 'Information technology';
const COUNTRY = { countryCode: 'DE', countryName: 'Germany' };
const ENTITY_ID = /^Q\d+$/;

const CITY_VALUES = targetCities
  .map(({ city, wikidata_id }) => `(wd:${wikidata_id} ${JSON.stringify(city)})`)
  .join(' ');

const QUERY = `
SELECT ?company ?companyLabel
       ?targetCity
       (SAMPLE(?website) AS ?officialWebsite)
       (MIN(?founded) AS ?foundedDate)
       (MAX(?employees) AS ?employeeCount)
WHERE {
  VALUES (?city ?targetCity) { ${CITY_VALUES} }
  ?company wdt:P159 ?hq.
  ?hq wdt:P131* ?city.
  ?company wdt:P452/wdt:P279* wd:Q11661.
  OPTIONAL { ?company wdt:P856 ?website. }
  OPTIONAL { ?company wdt:P571 ?founded. }
  OPTIONAL { ?company wdt:P1128 ?employees. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,de". }
}
GROUP BY ?company ?companyLabel ?targetCity
ORDER BY ?companyLabel`;

@Injectable()
export class WikidataAdapter extends SourceAdapter {
  readonly name = SOURCE;
  readonly cron: string;
  private readonly sparqlUrl: string;
  private readonly userAgent: string;

  constructor(config: ConfigService<Env, true>) {
    super();
    this.cron = config.get('WIKIDATA_SYNC_CRON', { infer: true });
    this.sparqlUrl = config.get('WIKIDATA_SPARQL_URL', { infer: true });
    this.userAgent = config.get('WIKIDATA_USER_AGENT', { infer: true });
  }

  async *fetchBatches(): AsyncIterable<unknown> {
    const url = new URL(this.sparqlUrl);
    url.searchParams.set('query', QUERY);
    const response = await fetch(url, {
      headers: {
        Accept: 'application/sparql-results+json',
        'User-Agent': this.userAgent,
      },
    });
    if (!response.ok) {
      throw new Error(`Wikidata responded with ${String(response.status)}`);
    }
    const body: unknown = await response.json();
    yield body;
  }

  normalize(raw: unknown): CompanyCandidate[] {
    const { bindings } = wikidataResponseSchema.parse(raw).results;
    const byEntity = new Map<string, WikidataBinding[]>();
    for (const binding of bindings) {
      const rows = byEntity.get(binding.company.value) ?? [];
      rows.push(binding);
      byEntity.set(binding.company.value, rows);
    }
    return [...byEntity.values()].flatMap((rows) => {
      const [first] = rows;
      return first ? [toCandidate(first, rows)] : [];
    });
  }
}

function toCandidate(
  first: WikidataBinding,
  rows: WikidataBinding[],
): CompanyCandidate {
  const website = textOrNull(first.officialWebsite?.value);
  return {
    source: SOURCE,
    externalId: first.company.value.split('/').at(-1) ?? first.company.value,
    name: labelOrEmpty(first.companyLabel.value),
    legalName: null,
    domain: toDomain(website),
    websiteUrl: website,
    companyType: null,
    description: null,
    numberOfEmployees: toEmployees(first.employeeCount?.value),
    employeeRange: null,
    foundingYear: toYear(first.foundedDate?.value),
    locations: [...new Set(rows.map((row) => row.targetCity.value))].map(
      (city) => ({ ...COUNTRY, stateName: null, city, postalCode: null }),
    ),
    industries: [INDUSTRY],
    skills: [],
  };
}

function labelOrEmpty(label: string): string {
  return ENTITY_ID.test(label) ? '' : label;
}

function toEmployees(value: string | undefined): number | null {
  const count = Number(value);
  return value !== undefined && Number.isFinite(count)
    ? Math.round(count)
    : null;
}

function toYear(value: string | undefined): number | null {
  const year =
    value === undefined ? Number.NaN : new Date(value).getUTCFullYear();
  return Number.isNaN(year) ? null : year;
}
