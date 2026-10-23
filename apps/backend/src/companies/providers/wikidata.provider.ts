import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../../config/env.js';
import {
  buildSingleCompanyQuery,
  buildSparqlQuery,
  parseWikidataResults,
} from '../utils/sparql.js';
import type {
  CompanyDataProvider,
  CompanySearchParams,
  NormalizedCompany,
} from './company-data-provider.js';

/**
 * Wikidata API response structure for company queries.
 * This is a simplified version based on SPARQL query results.
 */
type WikidataBinding = Record<
  string,
  {
    type: string;
    value: string;
    'xml:lang'?: string;
  }
>;

interface WikidataResult {
  bindings: WikidataBinding[];
}

export interface WikidataResponse {
  head: {
    vars: string[];
  };
  results: WikidataResult;
}

/**
 * Normalized Wikidata company from SPARQL query.
 */
export interface WikidataCompany {
  company: string;
  companyLabel: string;
  website?: string | undefined;
  founded?: string | undefined;
  employees?: string | undefined;
  hq?: string | undefined;
  hqLabel?: string | undefined;
  industry?: string | undefined;
  industryLabel?: string | undefined;
}

/**
 * Request headers for the Wikidata Query Service.
 * The charset is required: without it, the service decodes the query as
 * Latin-1 and non-ASCII search terms (e.g. "München") never match.
 * Wikimedia's User-Agent policy asks clients to identify themselves.
 */
const SPARQL_HEADERS = {
  'Content-Type': 'application/sparql-query; charset=utf-8',
  Accept: 'application/sparql-results+json',
  'User-Agent': 'job-scraper/0.0.0 (company import)',
};

@Injectable()
export class WikidataProvider implements CompanyDataProvider {
  private readonly logger = new Logger(WikidataProvider.name);
  private readonly endpoint: string;

  constructor(config: ConfigService<Env, true>) {
    this.endpoint = config.get('WIKIDATA_API_URL', { infer: true });
  }

  /**
   * Fetch companies from Wikidata based on search parameters.
   */
  async fetchCompanies(
    params: CompanySearchParams,
  ): Promise<WikidataCompany[]> {
    const query = buildSparqlQuery(params);
    this.logger.debug(`Executing SPARQL query: ${query}`);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: SPARQL_HEADERS,
        body: query,
      });

      if (!response.ok) {
        throw new Error(
          `Wikidata API request failed: ${String(response.status)} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as WikidataResponse;
      return parseWikidataResults(data);
    } catch (error) {
      this.logger.error(`Failed to fetch from Wikidata: ${String(error)}`);
      throw error;
    }
  }

  /**
   * Fetch a single company by name or identifier from Wikidata.
   */
  async fetchCompany(identifier: string): Promise<WikidataCompany | null> {
    const query = buildSingleCompanyQuery(identifier);
    this.logger.debug(`Executing single company SPARQL query: ${query}`);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: SPARQL_HEADERS,
        body: query,
      });

      if (!response.ok) {
        throw new Error(
          `Wikidata API request failed: ${String(response.status)} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as WikidataResponse;
      const companies = parseWikidataResults(data);
      return companies[0] ?? null;
    } catch (error) {
      this.logger.error(
        `Failed to fetch company from Wikidata: ${String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Normalize Wikidata company data to the common format.
   */
  normalizeCompany(company: WikidataCompany): NormalizedCompany {
    // Extract domain from website URL
    let domain: string | null = null;
    let websiteUrl: string | null = null;

    if (company.website) {
      websiteUrl = company.website;
      try {
        const url = new URL(company.website);
        domain = url.hostname.replace(/^www\./, '');
      } catch {
        // Invalid URL, keep null
      }
    }

    // Parse founding year from ISO date
    let foundingYear: number | null = null;
    if (company.founded) {
      try {
        // Handle various date formats: "1995", "1995-01-01", "+1995-01-01"
        const yearMatch = /[+]?(\d{4})/.exec(company.founded);
        if (yearMatch?.[1]) {
          foundingYear = parseInt(yearMatch[1], 10);
        }
      } catch {
        // Unable to parse year
      }
    }

    // Parse employee count
    let numberOfEmployees: number | null = null;
    let employeeRange: string | null = null;

    if (company.employees) {
      // Check if it's a range like "50-100" or a number

      if (company.employees.includes('-')) {
        employeeRange = company.employees;
      } else {
        const num = parseInt(company.employees, 10);
        if (!isNaN(num)) {
          numberOfEmployees = num;
        }
      }
    }

    return {
      name: company.companyLabel || company.company || null,
      legalName: null, // Wikidata typically doesn't distinguish
      domain,
      websiteUrl,
      companyType: company.industryLabel ?? null,
      description: null, // Not typically available in basic queries
      numberOfEmployees,
      employeeRange,
      foundingYear,
      source: 'wikidata',
      externalId: company.company,
      rawData: company,
    };
  }
}
