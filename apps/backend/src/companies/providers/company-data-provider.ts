export interface CompanyDataProvider<TRequest> {
  fetchCompanies(request: TRequest): Promise<unknown[]>;
}

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
  source: string;
  externalId: string | null;
  rawData: unknown;
}

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
