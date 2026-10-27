import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type EntityManager, Repository } from 'typeorm';

import { IndustriesService } from '../industries/industries.service.js';
import { LocationsService } from '../locations/locations.service.js';
import type { CompanyDto } from './dto/company.dto.js';
import type { CompanyEnrichSearchRequest } from './dto/company-enrich-search.dto.js';
import { Company } from './entities/company.entity.js';
import { CompanyIndustry } from './entities/company-industry.entity.js';
import { CompanyLocation } from './entities/company-location.entity.js';
import type {
  CompanySearchParams,
  NormalizedCompany,
} from './providers/company-data-provider.js';
import { CompanyEnrichProvider } from './providers/company-enrich.provider.js';
import { WikidataProvider } from './providers/wikidata.provider.js';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    private readonly locationsService: LocationsService,
    private readonly industriesService: IndustriesService,
    private readonly wikidataProvider: WikidataProvider,
    private readonly companyEnrichProvider: CompanyEnrichProvider,
  ) {}

  async fetchFromWikidata(
    params: CompanySearchParams,
  ): Promise<NormalizedCompany[]> {
    const rawCompanies = await this.wikidataProvider.fetchCompanies(params);
    const companies = rawCompanies.map((c) =>
      this.wikidataProvider.normalizeCompany(c),
    );
    this.logger.debug(
      `Fetched ${String(companies.length)} companies from wikidata`,
    );
    return companies;
  }

  async fetchFromCompanyEnrich(
    request: CompanyEnrichSearchRequest,
  ): Promise<NormalizedCompany[]> {
    const rawCompanies =
      await this.companyEnrichProvider.fetchCompanies(request);
    const companies = rawCompanies.map((c) =>
      this.companyEnrichProvider.normalizeCompany(c),
    );
    this.logger.debug(
      `Fetched ${String(companies.length)} companies from company-enrich`,
    );
    return companies;
  }

  async createFromNormalized(company: NormalizedCompany): Promise<CompanyDto> {
    return this.companiesRepository.manager.transaction(async (manager) => {
      const saved = await this.upsertCompany(company, manager);
      const companyId = saved.id;
      if (company.location) {
        const location = await this.locationsService.findOrCreate(
          company.location,
          manager,
        );
        await manager.save(CompanyLocation, {
          companyId,
          locationId: location.id,
        });
      }
      for (const name of company.industries) {
        const industry = await this.industriesService.findOrCreate(
          name,
          manager,
        );
        await manager.save(CompanyIndustry, {
          companyId,
          industryId: industry.id,
        });
      }
      return saved;
    });
  }

  private async upsertCompany(
    company: NormalizedCompany,
    manager: EntityManager,
  ): Promise<Company> {
    const companiesRepository = manager.getRepository(Company);
    let existingCompany: Company | null = null;
    if (company.domain) {
      existingCompany = await companiesRepository.findOneBy({
        domain: company.domain,
      });
    }

    if (!existingCompany && company.websiteUrl) {
      existingCompany = await companiesRepository.findOneBy({
        websiteUrl: company.websiteUrl,
      });
    }

    if (existingCompany) {
      existingCompany = companiesRepository.merge(existingCompany, {
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
      return companiesRepository.save(existingCompany);
    }

    const newCompany = companiesRepository.create({
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

    return companiesRepository.save(newCompany);
  }

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
      }
    }

    return results;
  }

  async findAll(): Promise<CompanyDto[]> {
    return this.companiesRepository.find();
  }

  async findById(id: string): Promise<CompanyDto> {
    const company = await this.companiesRepository.findOneBy({ id });
    if (!company) {
      throw new NotFoundException(`Company "${id}" not found`);
    }
    return company;
  }

  async findByDomain(domain: string): Promise<CompanyDto> {
    const company = await this.companiesRepository.findOneBy({ domain });
    if (!company) {
      throw new NotFoundException(`Company with domain "${domain}" not found`);
    }
    return company;
  }

  async search(params: CompanySearchParams): Promise<CompanyDto[]> {
    const query = this.companiesRepository.createQueryBuilder('company');

    if (params.query) {
      query.andWhere(
        '(company.name ILIKE :query OR company.legalName ILIKE :query OR company.websiteUrl ILIKE :query)',
        { query: `%${params.query}%` },
      );
    }

    if (params.location) {
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
