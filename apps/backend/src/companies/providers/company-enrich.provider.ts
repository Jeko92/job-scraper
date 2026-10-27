import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../../config/env.js';
import type {
  CompanyEmployees,
  CompanyEnrichSearchRequest,
} from '../dto/company-enrich-search.dto.js';
import { domainFromUrl } from '../utils/domain-from-url.js';
import type {
  CompanyDataProvider,
  NormalizedCompany,
} from './company-data-provider.js';

type CompanySearchPageInput = Omit<CompanyEnrichSearchRequest, 'location'> & {
  countries?: string[];
  states?: number[];
  cities?: number[];
};

type GeoKind = 'states' | 'cities';

interface GeoSearchRequest {
  query: string;
  countryCodes: string[] | null;
  page: number;
}

interface PaginatedList<T> {
  items: T[];
}

interface GeoInfo {
  id: number;
  name: string;
}

export interface CompanyInfo {
  id: string;
  name: string | null;
  domain: string | null;
  website: string | null;
  type: string | null;
  legalName: string | null;
  description: string | null;
  employees: CompanyEmployees | null;
  reported_employees: CompanyEmployees | null;
  founded_year: number | null;
  location: CompanyLocationInfo | null;
  industries: string[] | null;
}

interface CompanyLocationInfo {
  country: { code: string; name: string } | null;
  state: { name: string } | null;
  city: { name: string } | null;
  postal_code: string | null;
}

const ESTIMATED_EMPLOYEES: Record<CompanyEmployees, number> = {
  '1-10': 5,
  '11-50': 30,
  '51-200': 125,
  '201-500': 350,
  '501-1K': 750,
  '1K-5K': 3000,
  '5K-10K': 7500,
  'over-10K': 15000,
};

@Injectable()
export class CompanyEnrichProvider implements CompanyDataProvider<CompanyEnrichSearchRequest> {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: ConfigService<Env, true>) {
    this.baseUrl = config.get('COMPANYENRICH_API_URL', { infer: true });
    this.apiKey = config.get('COMPANYENRICH_API_KEY', { infer: true });
  }

  async fetchCompanies({
    location,
    ...search
  }: CompanyEnrichSearchRequest): Promise<CompanyInfo[]> {
    const body: CompanySearchPageInput = { ...search };
    if (location?.country) {
      body.countries = [location.country];
    }
    if (location?.state) {
      body.states = [
        await this.findGeoId('states', location.state, location.country),
      ];
    }
    if (location?.city) {
      body.cities = [
        await this.findGeoId('cities', location.city, location.country),
      ];
    }

    const data = await this.post<PaginatedList<CompanyInfo>>(
      'companies/search',
      body,
    );
    return data.items;
  }

  normalizeCompany(company: CompanyInfo): NormalizedCompany {
    const websiteUrl = company.website
      ? company.website.replace(/^(?!https?:\/\/)/, 'https://')
      : null;
    const employeeRange = company.employees ?? company.reported_employees;

    return {
      name: company.name,
      legalName: company.legalName,
      domain: (websiteUrl ? domainFromUrl(websiteUrl) : null) ?? company.domain,
      websiteUrl,
      companyType: company.type,
      description: company.description,
      numberOfEmployees: employeeRange
        ? ESTIMATED_EMPLOYEES[employeeRange]
        : null,
      employeeRange,
      foundingYear: company.founded_year,
      location: company.location && {
        countryCode: company.location.country?.code ?? null,
        countryName: company.location.country?.name ?? null,
        stateName: company.location.state?.name ?? null,
        city: company.location.city?.name ?? null,
        postalCode: company.location.postal_code,
      },
      industries: company.industries ?? [],
      source: 'company-enrich',
      externalId: company.id,
      rawData: company,
    };
  }

  private async findGeoId(
    kind: GeoKind,
    name: string,
    country: string | undefined,
  ): Promise<number> {
    const request: GeoSearchRequest = {
      query: name,
      countryCodes: country ? [country] : null,
      page: 1,
    };
    const data = await this.post<PaginatedList<GeoInfo>>(
      `geo/${kind}`,
      request,
    );
    const match = data.items.find(
      (item) => item.name.toLowerCase() === name.toLowerCase(),
    );
    if (!match) {
      throw new BadRequestException(
        `CompanyEnrich has no ${kind} entry named "${name}"`,
      );
    }
    return match.id;
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(new URL(path, this.baseUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        `CompanyEnrich POST /${path} failed: ${String(response.status)} ${response.statusText} - ${await response.text()}`,
      );
    }

    return (await response.json()) as T;
  }
}
