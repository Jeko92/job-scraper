import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../../config/env.js';
import { domainFromUrl } from '../utils/domain-from-url.js';
import { buildSparqlQuery, parseWikidataResults } from '../utils/sparql.js';
import type {
  CompanyDataProvider,
  CompanySearchParams,
  NormalizedCompany,
} from './company-data-provider.js';

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
export class WikidataProvider implements CompanyDataProvider<CompanySearchParams> {
  private readonly logger = new Logger(WikidataProvider.name);
  private readonly endpoint: string;

  constructor(config: ConfigService<Env, true>) {
    this.endpoint = config.get('WIKIDATA_API_URL', { infer: true });
  }

  async fetchCompanies(
    params: CompanySearchParams,
  ): Promise<WikidataCompany[]> {
    const query = buildSparqlQuery(params);
    this.logger.debug(`Executing SPARQL query: ${query}`);

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

    return parseWikidataResults((await response.json()) as WikidataResponse);
  }

  normalizeCompany(company: WikidataCompany): NormalizedCompany {
    const yearMatch = company.founded && /(\d{4})/.exec(company.founded);
    const employees = company.employees;
    const isEmployeeRange = employees?.includes('-') ?? false;
    const employeeCount =
      employees && !isEmployeeRange ? parseInt(employees, 10) : NaN;

    return {
      name: company.companyLabel || company.company || null,
      legalName: null,
      domain: company.website ? domainFromUrl(company.website) : null,
      websiteUrl: company.website ?? null,
      companyType: company.industryLabel ?? null,
      description: null,
      numberOfEmployees: isNaN(employeeCount) ? null : employeeCount,
      employeeRange: isEmployeeRange ? (employees ?? null) : null,
      foundingYear: yearMatch?.[1] ? parseInt(yearMatch[1], 10) : null,
      location: null,
      source: 'wikidata',
      externalId: company.company,
      rawData: company,
    };
  }
}
