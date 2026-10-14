import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import searchConfig from '../../../common/utils/companyenrich-search.json' with { type: 'json' };
import type { Env } from '../../../config/env.js';
import {
  type CompanyCandidate,
  textOrNull,
  toDomain,
} from '../../normalized-company.js';
import { SourceAdapter } from '../source-adapter.js';
import { targetCities } from '../target-cities.js';
import {
  citySearchResponseSchema,
  companyCountResponseSchema,
  type CompanyInfo,
  companyInfoSchema,
  companySearchBatchSchema,
  companySearchConfigSchema,
} from './companyenrich-response.js';

const SOURCE = 'companyenrich';
const COUNTRY = { code: 'DE', name: 'Germany' };
const COUNTRY_CODES = [COUNTRY.code];
const FIRST_PAGE = 1;
const UNKNOWN_TYPE = 'unknown';
const SEARCH = companySearchConfigSchema.parse(searchConfig);

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
    for (const { city, companyenrich_name } of targetCities) {
      const lookupName = companyenrich_name ?? city;
      const cityId = await this.findCityId(lookupName);
      if (cityId === null) {
        this.logger.warn(`No CompanyEnrich city found for "${lookupName}"`);
        continue;
      }
      const filters = SEARCH.employee_groups.map((employees) => ({
        countries: COUNTRY_CODES,
        cities: [cityId],
        naicsCode: SEARCH.naics_codes,
        employees,
      }));
      const available = await Promise.all(
        filters.map((filter) => this.count(filter)),
      );
      const pageSizes = allocate(this.companiesPerCity, available);
      for (const [index, filter] of filters.entries()) {
        const pageSize = pageSizes[index] ?? 0;
        if (pageSize === 0) {
          continue;
        }
        const response = await this.post('/companies/search', {
          ...filter,
          page: FIRST_PAGE,
          pageSize,
        });
        yield { city, response };
      }
    }
  }

  normalize(raw: unknown): CompanyCandidate[] {
    const { city, response } = companySearchBatchSchema.parse(raw);
    return response.items.flatMap((item) => {
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
      return [toCandidate(result.data, city)];
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

  private async count(filter: object): Promise<number> {
    const { total } = companyCountResponseSchema.parse(
      await this.post('/companies/search/count', filter),
    );
    return total;
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

function allocate(total: number, available: number[]): number[] {
  const sizes = available.map(() => 0);
  let remaining = total;
  let open = available.flatMap((count, index) => (count > 0 ? [index] : []));
  while (remaining > 0 && open.length > 0) {
    const share = Math.max(1, Math.floor(remaining / open.length));
    for (const index of open) {
      const room = (available[index] ?? 0) - (sizes[index] ?? 0);
      const added = Math.min(share, room, remaining);
      sizes[index] = (sizes[index] ?? 0) + added;
      remaining -= added;
    }
    open = open.filter(
      (index) => (sizes[index] ?? 0) < (available[index] ?? 0),
    );
  }
  return sizes;
}

function describe(item: unknown): string {
  if (typeof item === 'object' && item !== null && 'id' in item) {
    return JSON.stringify(item.id);
  }
  return '(no id)';
}

function toCandidate(company: CompanyInfo, city: string): CompanyCandidate {
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
    locations: [
      {
        countryCode: textOrNull(location?.country?.code) ?? COUNTRY.code,
        countryName: textOrNull(location?.country?.name) ?? COUNTRY.name,
        stateName: textOrNull(location?.state?.name),
        city,
        postalCode: textOrNull(location?.postal_code),
      },
    ],
    industries: company.industries ?? [],
    skills: company.technologies ?? [],
  };
}
