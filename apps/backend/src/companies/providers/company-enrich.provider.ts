import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../../config/env.js';
import type {
  CompanyDataProvider,
  CompanySearchParams,
  NormalizedCompany,
} from './company-data-provider.js';

/**
 * CompanyEnrich API request types.
 * Based on their OpenAPI documentation at https://docs.companyenrich.com
 */
interface CompanySearchPageInput {
  page?: number;
  pageSize?: number;
  query?: string | null;
  countries?: string[] | null;
  industries?: string[] | null;
  employees?: CompanyEmployees[] | null;
  revenue?: CompanyRevenue[] | null;
  foundedYear?: YearRange | null;
  keywords?: string[] | null;
  technologies?: string[] | null;
  type?: CompanyType[] | null;
  category?: CompanyCategory[] | null;
  semanticQuery?: string | null;
  semanticWeight?: number | null;
}

interface YearRange {
  min?: number | null;
  max?: number | null;
}

/**
 * CompanyEnrich API response types.
 * Based on their OpenAPI documentation at https://docs.companyenrich.com
 */
interface PaginatedListOfCompanyInfo {
  items: CompanyInfo[];
  page: number;
  totalPages: number;
  totalItems: number;
}

interface CompanyInfo {
  id: string;
  name: string | null;
  domain: string | null;
  website: string | null;
  type: CompanyType | null;
  legalName: string | null;
  industry: string | null;
  industries: string[] | null;
  categories: CompanyCategory[] | null;
  employees: CompanyEmployees | null;
  reported_employees: CompanyEmployees | null;
  revenue: CompanyRevenue | null;
  description: string | null;
  keywords: string[] | null;
  technologies: string[] | null;
  subsidiaries: string[] | null;
  founded_year: number | null;
  naics_codes: string[] | null;
  location: CompanyLocationInfo | null;
  financial: CompanyFinancialInfo | null;
  socials: CompanySocialUrls | null;
  page_rank: number | null;
  logo_url: string | null;
  seo_description: string | null;
  updated_at: string | null;
}

interface CompanyLocationInfo {
  country: CountryInfo | null;
  state: StateInfo | null;
  city: CityInfo | null;
  address: string | null;
  postal_code: string | null;
  phone: string | null;
}

interface CountryInfo {
  code: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

interface StateInfo {
  id: number;
  name: string;
  code: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface CityInfo {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

interface CompanyFinancialInfo {
  stock_symbol: string | null;
  stock_exchange: string | null;
  total_funding: number | null;
  funding_stage: string | null;
  funding_date: string | null;
  funding: CompanyFundingInfo[] | null;
}

interface CompanyFundingInfo {
  date: string | null;
  amount: string | null;
  type: string | null;
  url: string | null;
  from: string | null;
}

interface CompanySocialUrls {
  linkedin_url: string | null;
  linkedin_id: string | null;
  twitter_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  angellist_url: string | null;
  crunchbase_url: string | null;
  youtube_url: string | null;
  github_url: string | null;
  g2_url: string | null;
}

// Enums
type CompanyType =
  | 'private'
  | 'public'
  | 'self-employed'
  | 'self-owned'
  | 'partnership'
  | 'nonprofit'
  | 'educational'
  | 'government';

type CompanyCategory =
  | 'b2b'
  | 'b2c'
  | 'b2g'
  | 'e-commerce'
  | 'media'
  | 'service-provider'
  | 'mobile'
  | 'saas';

type CompanyEmployees =
  | '1-10'
  | '11-50'
  | '51-200'
  | '201-500'
  | '501-1K'
  | '1K-5K'
  | '5K-10K'
  | 'over-10K';

type CompanyRevenue =
  | 'under-1m'
  | '1m-10m'
  | '10m-50m'
  | '50m-100m'
  | '100m-200m'
  | '200m-1b'
  | 'over-1b';

@Injectable()
export class CompanyEnrichProvider implements CompanyDataProvider {
  private readonly logger = new Logger(CompanyEnrichProvider.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: ConfigService<Env, true>) {
    this.baseUrl = config.get('COMPANYENRICH_API_URL', { infer: true });
    this.apiKey = config.get('COMPANYENRICH_API_KEY', { infer: true });
  }

  /**
   * Map CompanySearchParams to CompanySearchPageInput for the API.
   */
  private mapSearchParamsToRequestBody(
    params: CompanySearchParams,
  ): CompanySearchPageInput {
    const body: CompanySearchPageInput = {};

    // Map query
    if (params.query) {
      body.query = params.query;
    }

    // Map pagination: convert offset/limit to page/pageSize
    // page is 1-indexed, so page = (offset / limit) + 1
    if (params.limit) {
      body.pageSize = params.limit;
    }
    if (params.limit) {
      body.page = Math.floor(params.offset / params.limit) + 1;
    } else {
      body.page = params.offset + 1;
    }

    // Map location to countries (assuming location is country code for now)
    if (params.location) {
      body.countries = [params.location];
    }

    // Map industry
    if (params.industry) {
      body.industries = [params.industry];
    }

    // Map employee range filters
    if (params.minEmployees || params.maxEmployees) {
      body.employees = this.mapEmployeeRangeToApiFilter(
        params.minEmployees,
        params.maxEmployees,
      );
    }

    // Map founded year range
    if (
      params.foundedAfter !== undefined ||
      params.foundedBefore !== undefined
    ) {
      body.foundedYear = {
        min: params.foundedAfter ?? null,
        max: params.foundedBefore ?? null,
      };
    }

    return body;
  }

  /**
   * Map min/max employee counts to the API's employee range enum.
   * This is a simplified mapping - the API uses predefined ranges.
   */
  private mapEmployeeRangeToApiFilter(
    minEmployees?: number,
    maxEmployees?: number,
  ): CompanyEmployees[] | null {
    if (!minEmployees && !maxEmployees) {
      return null;
    }

    const ranges: CompanyEmployees[] = [];
    const min = minEmployees ?? 0;
    const max = maxEmployees ?? Infinity;

    // Map based on ranges
    if (min <= 10 && max >= 1) ranges.push('1-10');
    if (min <= 50 && max >= 11) ranges.push('11-50');
    if (min <= 200 && max >= 51) ranges.push('51-200');
    if (min <= 500 && max >= 201) ranges.push('201-500');
    if (min <= 1000 && max >= 501) ranges.push('501-1K');
    if (min <= 5000 && max >= 1001) ranges.push('1K-5K');
    if (min <= 10000 && max >= 5001) ranges.push('5K-10K');
    if (max >= 10001) ranges.push('over-10K');

    return ranges.length > 0 ? ranges : null;
  }

  /**
   * Fetch companies from CompanyEnrich based on search parameters.
   * Uses POST /companies/search endpoint as per API documentation.
   */
  async fetchCompanies(params: CompanySearchParams): Promise<CompanyInfo[]> {
    const endpoint = `${this.baseUrl}/companies/search`;
    const requestBody = this.mapSearchParamsToRequestBody(params);

    // Ensure page is set (default to 1)
    requestBody.page ||= 1;
    // Ensure pageSize is set (default to 10, max 100)
    requestBody.pageSize ||= params.limit || 10;
    // Clamp pageSize to max 100
    requestBody.pageSize = Math.min(requestBody.pageSize, 100);

    this.logger.debug(
      `Fetching companies from CompanyEnrich: ${endpoint} with body: ${JSON.stringify(requestBody)}`,
    );

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `CompanyEnrich API request failed: ${String(response.status)} ${response.statusText}`;
        if (errorText) {
          errorMessage += ` - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const data = (await response.json()) as PaginatedListOfCompanyInfo;

      return data.items;
    } catch (error) {
      this.logger.error(`Failed to fetch from CompanyEnrich: ${String(error)}`);
      throw error;
    }
  }

  /**
   * Fetch a single company by identifier from CompanyEnrich.
   * Note: The new API doesn't have a direct GET by ID endpoint in the search path,
   * but we can use search with a specific domain or name query.
   */
  async fetchCompany(identifier: string): Promise<CompanyInfo | null> {
    // Try to fetch by domain or name using search
    const endpoint = `${this.baseUrl}/companies/search`;

    // Try with domain first
    const requestBody: CompanySearchPageInput = {
      page: 1,
      pageSize: 1,
      query: identifier,
    };

    this.logger.debug(
      `Fetching single company from CompanyEnrich: ${endpoint} with body: ${JSON.stringify(requestBody)}`,
    );

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorText = await response.text();
        throw new Error(
          `CompanyEnrich API request failed: ${String(response.status)} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`,
        );
      }

      const data = (await response.json()) as PaginatedListOfCompanyInfo;

      return data.items[0] ?? null;
    } catch (error) {
      this.logger.error(
        `Failed to fetch company from CompanyEnrich: ${String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Normalize CompanyEnrich CompanyInfo data to the common format.
   */
  normalizeCompany(company: CompanyInfo): NormalizedCompany {
    // Normalize website URL and extract domain
    let websiteUrl: string | null = null;
    let domain: string | null = null;

    if (company.website) {
      // Ensure website has protocol
      let normalizedWebsite = company.website;
      if (
        !normalizedWebsite.startsWith('http://') &&
        !normalizedWebsite.startsWith('https://')
      ) {
        normalizedWebsite = `https://${normalizedWebsite}`;
      }
      websiteUrl = normalizedWebsite;

      try {
        const url = new URL(normalizedWebsite);
        domain = url.hostname.replace(/^www\./, '');
      } catch {
        // Invalid URL, use the domain from company if available
        domain = company.domain ?? null;
      }
    }

    // Use domain from company if website doesn't provide it
    if (!domain && company.domain) {
      domain = company.domain;
    }

    // Map employee range from enum to number or keep as string
    let numberOfEmployees: number | null = null;
    let employeeRange: string | null = null;

    if (company.employees) {
      employeeRange = company.employees;
      // Try to extract approximate number from range
      numberOfEmployees = this.estimateEmployeesFromRange(company.employees);
    } else if (company.reported_employees) {
      employeeRange = company.reported_employees;
      numberOfEmployees = this.estimateEmployeesFromRange(
        company.reported_employees,
      );
    }

    // Map company type
    const companyType = company.type;

    return {
      name: company.name,
      legalName: company.legalName,
      domain,
      websiteUrl,
      companyType,
      description: company.description,
      numberOfEmployees,
      employeeRange,
      foundingYear: company.founded_year ?? null,
      source: 'company-enrich',
      externalId: company.id,
      rawData: company,
    };
  }

  /**
   * Estimate employee count from the API's range enum.
   * Returns the midpoint of the range for approximate counting.
   */
  private estimateEmployeesFromRange(range: CompanyEmployees): number {
    const rangeMap: Record<CompanyEmployees, number> = {
      '1-10': 5,
      '11-50': 30,
      '51-200': 125,
      '201-500': 350,
      '501-1K': 750,
      '1K-5K': 3000,
      '5K-10K': 7500,
      'over-10K': 15000,
    };
    return rangeMap[range];
  }
}
