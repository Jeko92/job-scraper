import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { CompanyDto } from './dto/company.dto.js';
import type { CompanyProvider } from './dto/fetch-companies.dto.js';
import { Company } from './entities/company.entity.js';
import type {
  CompanySearchParams,
  NormalizedCompany,
} from './providers/company-data-provider.js';
import { CompanyEnrichProvider } from './providers/company-enrich.provider.js';
import { WikidataProvider } from './providers/wikidata.provider.js';
import { mergeAndDeduplicate } from './utils/merge-companies.js';

/**
 * Options for fetching companies from external APIs.
 */
export interface FetchCompaniesOptions {
  /** Which providers to use. Defaults to all available. */
  providers?: CompanyProvider[];
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
      return mergeAndDeduplicate(results);
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
      return this.companiesRepository.save(existingCompany);
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

    return this.companiesRepository.save(newCompany);
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
    return this.companiesRepository.find();
  }

  /**
   * Get a company by ID.
   */
  async findById(id: string): Promise<CompanyDto> {
    const company = await this.companiesRepository.findOneBy({ id });
    if (!company) {
      throw new NotFoundException(`Company "${id}" not found`);
    }
    return company;
  }

  /**
   * Get a company by domain.
   */
  async findByDomain(domain: string): Promise<CompanyDto> {
    const company = await this.companiesRepository.findOneBy({ domain });
    if (!company) {
      throw new NotFoundException(`Company with domain "${domain}" not found`);
    }
    return company;
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

    return query.getMany();
  }
}
