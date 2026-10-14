import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import targetCities from '../../../common/utils/target-cities.json' with { type: 'json' };
import type { Env } from '../../../config/env.js';
import {
  type CompanyCandidate,
  textOrNull,
  toDomain,
} from '../../normalized-company.js';
import { SourceAdapter } from '../source-adapter.js';
import {
  citySearchResponseSchema,
  type CompanyInfo,
  companyInfoSchema,
  companySearchResponseSchema,
  targetCitiesSchema,
} from './companyenrich-response.js';

const SOURCE = 'companyenrich';
const COUNTRY_CODES = ['DE'];
const FIRST_PAGE = 1;
const UNKNOWN_TYPE = 'unknown';

@Injectable()
export class CompanyEnrichAdapter extends SourceAdapter {
  readonly name = SOURCE;
  readonly cron: string;
  private readonly logger = new Logger(CompanyEnrichAdapter.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly companiesPerCity: number;

  constructor(config: ConfigService<Env, true>) {
    super();
    this.cron = config.get('COMPANYENRICH_SYNC_CRON', { infer: true });
    this.apiUrl = config.get('COMPANYENRICH_API_URL', { infer: true });
    this.apiKey = config.get('COMPANYENRICH_API_KEY', { infer: true });
    this.companiesPerCity = config.get('COMPANYENRICH_COMPANIES_PER_CITY', {
      infer: true,
    });
  }

  async *fetchBatches(): AsyncIterable<unknown> {
    for (const { city } of targetCitiesSchema.parse(targetCities)) {
      const cityId = await this.findCityId(city);
      if (cityId === null) {
        this.logger.warn(`No CompanyEnrich city found for "${city}"`);
        continue;
      }
      yield await this.post('/companies/search', {
        countries: COUNTRY_CODES,
        cities: [cityId],
        page: FIRST_PAGE,
        pageSize: this.companiesPerCity,
      });
    }
  }

  normalize(raw: unknown): CompanyCandidate[] {
    return companySearchResponseSchema.parse(raw).items.flatMap((item) => {
      const result = companyInfoSchema.safeParse(item);
      if (!result.success) {
        const fields = result.error.issues
          .map((issue) => issue.path.join('.'))
          .join(', ');
        this.logger.warn(
          `Skipped invalid CompanyEnrich company ${describe(item)}: ${fields}`,
        );
        return [];
      }
      return [toCandidate(result.data)];
    });
  }

  private async findCityId(city: string): Promise<number | null> {
    const { items } = citySearchResponseSchema.parse(
      await this.post('/geo/cities', {
        query: city,
        countryCodes: COUNTRY_CODES,
        page: FIRST_PAGE,
      }),
    );
    const exact = items.find(
      (item) => item.name.toLowerCase() === city.toLowerCase(),
    );
    if (exact) {
      return exact.id;
    }
    const [first] = items;
    if (first) {
      this.logger.warn(
        `No exact CompanyEnrich city match for "${city}", using "${first.name}"`,
      );
    }
    return first?.id ?? null;
  }

  private async post(path: string, body: object): Promise<unknown> {
    const response = await fetch(new URL(path, this.apiUrl), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(
        `CompanyEnrich ${path} responded with ${String(response.status)}`,
      );
    }
    const cost = response.headers.get('x-credit-cost');
    if (cost !== null) {
      this.logger.log(
        `CompanyEnrich ${path}: ${cost} credits, ${response.headers.get('x-credit-remaining') ?? '?'} remaining`,
      );
    }
    return await response.json();
  }
}

function describe(item: unknown): string {
  if (typeof item === 'object' && item !== null && 'id' in item) {
    return JSON.stringify(item.id);
  }
  return '(no id)';
}

function toCandidate(company: CompanyInfo): CompanyCandidate {
  const website = textOrNull(company.website);
  const type = textOrNull(company.type);
  const location = company.location;
  return {
    source: SOURCE,
    externalId: company.id,
    name: textOrNull(company.name) ?? '',
    legalName: textOrNull(company.legalName),
    domain: toDomain(textOrNull(company.domain) ?? website),
    websiteUrl: website,
    companyType: type === UNKNOWN_TYPE ? null : type,
    description: textOrNull(company.description),
    numberOfEmployees: null,
    employeeRange: textOrNull(company.employees),
    foundingYear: company.founded_year ?? null,
    locations: location
      ? [
          {
            countryCode: textOrNull(location.country?.code),
            countryName: textOrNull(location.country?.name),
            stateName: textOrNull(location.state?.name),
            city: textOrNull(location.city?.name),
            postalCode: textOrNull(location.postal_code),
          },
        ]
      : [],
    industries: company.industries ?? [],
    skills: company.technologies ?? [],
  };
}
