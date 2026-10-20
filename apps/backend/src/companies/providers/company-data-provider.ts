/**
 * Interface for company data providers.
 * Each provider implements methods to fetch company data from an external API.
 */
export interface CompanyDataProvider {
  /**
   * Fetch companies matching the given parameters.
   * @param params - Search/filter parameters
   * @returns Array of raw company data from the API
   */
  fetchCompanies(params: CompanySearchParams): Promise<unknown[]>;

  /**
   * Fetch a single company by identifier.
   * @param identifier - Company identifier (could be domain, name, or API-specific ID)
   * @returns Raw company data from the API
   */
  fetchCompany(identifier: string): Promise<unknown>;
}

/**
 * Common interface for normalized company data.
 * This is what all providers should normalize their data to.
 */
export interface NormalizedCompany {
  name: string | null;
  legalName: string | null;
  domain: string | null;
  websiteUrl: string | null;
  companyType: string | null;
  description: string | null;
  numberOfEmployees: number | null;
  employeeRange: string | null;
  foundingYear: number | null;
  source: string; // e.g., 'wikidata', 'company-enrich'
  externalId: string | null; // API-specific identifier
  rawData: unknown; // Original API response for debugging/inspection
}

/**
 * Parameters for searching companies.
 * Can include filters like location, industry, size, etc.
 */
export interface CompanySearchParams {
  query?: string | undefined;
  location?: string | undefined;
  industry?: string | undefined;
  minEmployees?: number | undefined;
  maxEmployees?: number | undefined;
  foundedAfter?: number | undefined;
  foundedBefore?: number | undefined;
  limit: number;
  offset: number;
}
