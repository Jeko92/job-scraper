import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../../config/env.js';
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

interface WikidataResponse {
  head: {
    vars: string[];
  };
  results: WikidataResult;
}

/**
 * Normalized Wikidata company from SPARQL query.
 */
interface WikidataCompany {
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
    const query = this.buildSparqlQuery(params);
    this.logger.debug(`Executing SPARQL query: ${query}`);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sparql-query',
          Accept: 'application/sparql-results+json',
        },
        body: query,
      });

      if (!response.ok) {
        throw new Error(
          `Wikidata API request failed: ${String(response.status)} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as WikidataResponse;
      return this.parseWikidataResults(data);
    } catch (error) {
      this.logger.error(`Failed to fetch from Wikidata: ${String(error)}`);
      throw error;
    }
  }

  /**
   * Fetch a single company by name or identifier from Wikidata.
   */
  async fetchCompany(identifier: string): Promise<WikidataCompany | null> {
    const query = this.buildSingleCompanyQuery(identifier);
    this.logger.debug(`Executing single company SPARQL query: ${query}`);
    console.log(query); //TODO: Remove

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sparql-query',
          Accept: 'application/sparql-results+json',
        },
        body: query,
      });
      console.log(response.body); //TODO: Remove

      if (!response.ok) {
        throw new Error(
          `Wikidata API request failed: ${String(response.status)} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as WikidataResponse;
      const companies = this.parseWikidataResults(data);
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

  /**
   * Build SPARQL query based on search parameters.
   */
  private buildSparqlQuery(params: CompanySearchParams): string {
    const { query, location, industry, limit, offset } = params;

    // Base query for German IT companies
    let whereClause = `
      # Match either country = Germany OR headquarters located in Germany
      { ?company wdt:P17 wd:Q183. }
      UNION
      { ?company wdt:P159/wdt:P17 wd:Q183. }

      # Subclasses of IT (software development, cloud computing, cybersecurity, etc.)
      ?company wdt:P452/wdt:P279* wd:Q11661.
    `;

    // Add filters based on params
    const filters: string[] = [];

    if (query !== undefined) {
      filters.push(
        `REGEX(?companyLabel, "${this.escapeSparqlString(query)}", "i")`,
      );
    }

    if (location !== undefined) {
      filters.push(
        `?company wdt:P159 ?hq . ?hq rdfs:label ?hqLabel . ` +
          `REGEX(?hqLabel, "${this.escapeSparqlString(location)}", "i")`,
      );
    }

    if (industry !== undefined) {
      filters.push(
        `?company wdt:P452 ?industry . ?industry rdfs:label ?industryLabel . ` +
          `REGEX(?industryLabel, "${this.escapeSparqlString(industry)}", "i")`,
      );
    }

    if (filters.length > 0) {
      whereClause += `
        FILTER(${filters.join(' && ')})
      `;
    }

    const limitOffset = `LIMIT ${String(limit)} OFFSET ${String(offset)}`;

    return `
      SELECT ?company ?companyLabel ?website ?founded ?employees ?hq ?hqLabel ?industry ?industryLabel
      WHERE {
        ${whereClause}

        # Optional attributes
        OPTIONAL { ?company wdt:P856 ?website. }
        OPTIONAL { ?company wdt:P571 ?founded. }
        OPTIONAL { ?company wdt:P1128 ?employees. }
        OPTIONAL { ?company wdt:P159 ?hq. }
        OPTIONAL { ?company wdt:P452 ?industry. }

        SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". }
      }
      GROUP BY ?company ?companyLabel ?website ?founded ?employees ?hq ?hqLabel ?industry ?industryLabel
      ORDER BY ?companyLabel
      ${limitOffset}
    `;
  }

  /**
   * Build SPARQL query for a single company by name.
   */
  private buildSingleCompanyQuery(identifier: string): string {
    return `
      SELECT ?company ?companyLabel ?website ?founded ?employees ?hq ?hqLabel ?industry ?industryLabel
      WHERE {
        ?company rdfs:label ?companyLabel .
        FILTER(REGEX(?companyLabel, "${this.escapeSparqlString(identifier)}", "i"))

        # Optional attributes
        OPTIONAL { ?company wdt:P856 ?website. }
        OPTIONAL { ?company wdt:P571 ?founded. }
        OPTIONAL { ?company wdt:P1128 ?employees. }
        OPTIONAL { ?company wdt:P159 ?hq. }
        OPTIONAL { ?company wdt:P452 ?industry. }

        SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". }
      }
      LIMIT 1
    `;
  }

  /**
   * Parse Wikidata SPARQL results into company objects.
   */
  private parseWikidataResults(data: WikidataResponse): WikidataCompany[] {
    const companies: WikidataCompany[] = [];

    for (const binding of data.results.bindings) {
      const company: WikidataCompany = {
        company: binding['company']?.value ?? '',
        companyLabel: binding['companyLabel']?.value ?? '',
        website: binding['website']?.value,
        founded: binding['founded']?.value,
        employees: binding['employees']?.value,
        hq: binding['hq']?.value,
        hqLabel: binding['hqLabel']?.value,
        industry: binding['industry']?.value,
        industryLabel: binding['industryLabel']?.value,
      };
      companies.push(company);
    }

    return companies;
  }

  /**
   * Escape special characters in SPARQL string literals.
   */
  private escapeSparqlString(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }
}
