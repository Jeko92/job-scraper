import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Company } from './entities/company.entity.js';
import type {
  CompanySearchParams,
  NormalizedCompany,
} from './providers/company-data-provider.js';
import { CompanyEnrichProvider } from './providers/company-enrich.provider.js';
import { WikidataProvider } from './providers/wikidata.provider.js';

/**
 * DTO for creating/updating a company.
 */
export interface CreateCompanyDto {
  name?: string | null;
  legalName?: string | null;
  domain?: string | null;
  websiteUrl?: string | null;
  companyType?: string | null;
  description?: string | null;
  numberOfEmployees?: number | null;
  employeeRange?: string | null;
  foundingYear?: number | null;
}

/**
 * DTO for company search results.
 */
export interface CompanyDto {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Options for fetching companies from external APIs.
 */
export interface FetchCompaniesOptions {
  /** Which providers to use. Defaults to all available. */
  providers?: ('wikidata' | 'company-enrich')[];
  /** Search parameters passed to each provider. */
  params: CompanySearchParams;
  /** Whether to merge results and deduplicate. Default: true. */
  mergeResults?: boolean;
  /** Whether to save to database. Default: false. */
  saveToDatabase?: boolean;
}

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    private readonly wikidataProvider: WikidataProvider,
    private readonly companyEnrichProvider: CompanyEnrichProvider,
  ) {}

  /**
   * Fetch companies from external APIs and optionally save to database.
   */
  async fetchFromApis(
    options: FetchCompaniesOptions,
  ): Promise<NormalizedCompany[]> {
    const {
      providers = ['wikidata', 'company-enrich'],
      params,
      mergeResults = true,
    } = options;

    const results: NormalizedCompany[] = [];

    // Fetch from each provider
    for (const providerName of providers) {
      try {
        const providerResults =
          providerName === 'wikidata'
            ? await this.fetchFromWikidata(params)
            : await this.fetchFromCompanyEnrich(params);

        results.push(...providerResults);
      } catch (error) {
        this.logger.warn(
          `Failed to fetch from ${providerName} provider: ${String(error)}`,
        );
        // Continue with other providers
      }
    }

    // Merge and deduplicate if requested
    if (mergeResults && results.length > 0) {
      return this.mergeAndDeduplicate(results);
    }

    return results;
  }

  /**
   * Fetch companies from Wikidata only.
   * Errors are propagated to the caller.
   */
  async fetchFromWikidata(
    params: CompanySearchParams,
  ): Promise<NormalizedCompany[]> {
    this.logger.debug('Fetching from wikidata provider');
    const rawCompanies = await this.wikidataProvider.fetchCompanies(params);
    const companies = rawCompanies.map((c) =>
      this.wikidataProvider.normalizeCompany(c),
    );
    this.logger.debug(
      `Fetched ${String(companies.length)} companies from wikidata`,
    );
    return companies;
  }

  /**
   * Fetch companies from CompanyEnrich only.
   * Errors are propagated to the caller.
   */
  async fetchFromCompanyEnrich(
    params: CompanySearchParams,
  ): Promise<NormalizedCompany[]> {
    this.logger.debug('Fetching from company-enrich provider');
    const rawCompanies =
      await this.companyEnrichProvider.fetchCompanies(params);
    const companies = rawCompanies.map((c) =>
      this.companyEnrichProvider.normalizeCompany(c),
    );
    this.logger.debug(
      `Fetched ${String(companies.length)} companies from company-enrich`,
    );
    return companies;
  }

  /**
   * Fetch a single company from external APIs.
   */
  async fetchFromApisByIdentifier(
    identifier: string,
    providers: ('wikidata' | 'company-enrich')[] = [
      'wikidata',
      'company-enrich',
    ],
  ): Promise<NormalizedCompany | null> {
    for (const providerName of providers) {
      try {
        this.logger.debug(
          `Fetching company "${identifier}" from ${providerName}`,
        );

        if (providerName === 'wikidata') {
          const rawCompany =
            await this.wikidataProvider.fetchCompany(identifier);
          if (rawCompany) {
            return this.wikidataProvider.normalizeCompany(rawCompany);
          }
        } else {
          const rawCompany =
            await this.companyEnrichProvider.fetchCompany(identifier);
          if (rawCompany) {
            return this.companyEnrichProvider.normalizeCompany(rawCompany);
          }
        }
      } catch (error) {
        this.logger.warn(
          `Failed to fetch company from ${providerName}: ${String(error)}`,
        );
        // Continue with other providers
      }
    }

    return null;
  }

  /**
   * Create a company from normalized data.
   */
  async createFromNormalized(company: NormalizedCompany): Promise<CompanyDto> {
    // Check if company already exists by domain
    let existingCompany: Company | null = null;
    if (company.domain) {
      existingCompany = await this.companiesRepository.findOneBy({
        domain: company.domain,
      });
    }

    // If no company found by domain, check by website URL
    if (!existingCompany && company.websiteUrl) {
      existingCompany = await this.companiesRepository.findOneBy({
        websiteUrl: company.websiteUrl,
      });
    }

    if (existingCompany) {
      // Update existing company
      existingCompany = this.companiesRepository.merge(existingCompany, {
        name: company.name ?? existingCompany.name,
        legalName: company.legalName ?? existingCompany.legalName,
        websiteUrl: company.websiteUrl ?? existingCompany.websiteUrl,
        companyType: company.companyType ?? existingCompany.companyType,
        description: company.description ?? existingCompany.description,
        numberOfEmployees:
          company.numberOfEmployees ?? existingCompany.numberOfEmployees,
        employeeRange: company.employeeRange ?? existingCompany.employeeRange,
        foundingYear: company.foundingYear ?? existingCompany.foundingYear,
        updatedAt: new Date(),
      });
      const saved = await this.companiesRepository.save(existingCompany);
      return this.toDto(saved, company.source);
    }

    // Create new company
    const newCompany = this.companiesRepository.create({
      name: company.name,
      legalName: company.legalName,
      domain: company.domain,
      websiteUrl: company.websiteUrl,
      companyType: company.companyType,
      description: company.description,
      numberOfEmployees: company.numberOfEmployees,
      employeeRange: company.employeeRange,
      foundingYear: company.foundingYear,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.companiesRepository.save(newCompany);
    return this.toDto(saved, company.source);
  }

  /**
   * Save multiple normalized companies to database.
   */
  async saveAllFromNormalized(
    companies: NormalizedCompany[],
  ): Promise<CompanyDto[]> {
    const results: CompanyDto[] = [];

    for (const company of companies) {
      try {
        const saved = await this.createFromNormalized(company);
        results.push(saved);
      } catch (error) {
        this.logger.error(
          `Failed to save company ${company.name ?? 'unknown'}: ${String(error)}`,
        );
        // Continue with next company
      }
    }

    return results;
  }

  /**
   * Get all companies from database.
   */
  async findAll(): Promise<CompanyDto[]> {
    const companies = await this.companiesRepository.find();
    return companies.map((c) => this.toDto(c, ''));
  }

  /**
   * Get a company by ID.
   */
  async findById(id: string): Promise<CompanyDto | null> {
    const company = await this.companiesRepository.findOneBy({ id });
    if (!company) {
      return null;
    }
    return this.toDto(company, '');
  }

  /**
   * Get a company by domain.
   */
  async findByDomain(domain: string): Promise<CompanyDto | null> {
    const company = await this.companiesRepository.findOneBy({ domain });
    if (!company) {
      return null;
    }
    return this.toDto(company, '');
  }

  /**
   * Search companies by name or other criteria.
   */
  async search(params: CompanySearchParams): Promise<CompanyDto[]> {
    const query = this.companiesRepository.createQueryBuilder('company');

    if (params.query) {
      query.andWhere(
        '(company.name ILIKE :query OR company.legalName ILIKE :query OR company.websiteUrl ILIKE :query)',
        { query: `%${params.query}%` },
      );
    }

    if (params.location) {
      // In a real implementation, this would join with company_locations
      // For now, we'll just add a simple where clause
      query.andWhere('company.name ILIKE :location', {
        location: `%${params.location}%`,
      });
    }

    if (params.industry) {
      query.andWhere('company.companyType ILIKE :industry', {
        industry: `%${params.industry}%`,
      });
    }

    if (params.minEmployees) {
      query.andWhere('company.numberOfEmployees >= :minEmployees', {
        minEmployees: params.minEmployees,
      });
    }

    if (params.maxEmployees) {
      query.andWhere('company.numberOfEmployees <= :maxEmployees', {
        maxEmployees: params.maxEmployees,
      });
    }

    if (params.foundedAfter) {
      query.andWhere('company.foundingYear >= :foundedAfter', {
        foundedAfter: params.foundedAfter,
      });
    }

    if (params.foundedBefore) {
      query.andWhere('company.foundingYear <= :foundedBefore', {
        foundedBefore: params.foundedBefore,
      });
    }

    if (params.limit) {
      query.limit(params.limit);
    }

    if (params.offset) {
      query.offset(params.offset);
    }

    const companies = await query.getMany();
    return companies.map((c) => this.toDto(c, ''));
  }

  /**
   * Merge results from multiple providers and deduplicate by domain/website.
   */
  private mergeAndDeduplicate(
    companies: NormalizedCompany[],
  ): NormalizedCompany[] {
    const seen = new Map<string, NormalizedCompany>();

    for (const company of companies) {
      // Use domain as the primary key for deduplication
      const key = company.domain ?? company.websiteUrl ?? company.name;

      if (!key) {
        continue;
      }

      const existing = seen.get(key.toLowerCase());

      if (!existing) {
        // First time seeing this company
        seen.set(key.toLowerCase(), company);
      } else {
        // Merge: prefer non-null values from the new company
        const merged: NormalizedCompany = {
          ...existing,
          name: company.name ?? existing.name,
          legalName: company.legalName ?? existing.legalName,
          websiteUrl: company.websiteUrl ?? existing.websiteUrl,
          companyType: company.companyType ?? existing.companyType,
          description: company.description ?? existing.description,
          numberOfEmployees:
            company.numberOfEmployees ?? existing.numberOfEmployees,
          employeeRange: company.employeeRange ?? existing.employeeRange,
          foundingYear: company.foundingYear ?? existing.foundingYear,
          // Prefer the first source for tracking
          source: existing.source,
          externalId: existing.externalId,
          rawData: company.rawData,
        };
        seen.set(key.toLowerCase(), merged);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Convert Company entity to DTO.
   */
  private toDto(company: Company, source: string): CompanyDto {
    return {
      id: company.id,
      name: company.name,
      legalName: company.legalName,
      domain: company.domain,
      websiteUrl: company.websiteUrl,
      companyType: company.companyType,
      description: company.description,
      numberOfEmployees: company.numberOfEmployees,
      employeeRange: company.employeeRange,
      foundingYear: company.foundingYear,
      source,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }
}
