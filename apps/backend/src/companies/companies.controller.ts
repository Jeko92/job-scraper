import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator.js';
import { CompaniesService } from './companies.service.js';
import type { CompanyDto } from './dto/company.dto.js';
import {
  type CreateCompanyRequest,
  createCompanySchema,
} from './dto/create-company.dto.js';
import {
  type FetchCompaniesQuery,
  fetchCompaniesQuerySchema,
} from './dto/fetch-companies.dto.js';
import {
  companySearchBodySchema,
  companySearchQuerySchema,
} from './dto/search-companies.dto.js';
import type {
  CompanySearchParams,
  NormalizedCompany,
} from './providers/company-data-provider.js';

@ApiTags('companies')
@ApiBearerAuth()
@Roles('admin')
@ApiForbiddenResponse({ description: 'Admin only' })
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'List all companies from the database' })
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<CompanyDto[]> {
    return this.companiesService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search companies in the database' })
  @HttpCode(HttpStatus.OK)
  async search(
    @Query({
      schema: companySearchQuerySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    params: CompanySearchParams,
  ): Promise<CompanyDto[]> {
    return this.companiesService.search(params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company by its ID' })
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<CompanyDto> {
    return this.companiesService.findById(id);
  }

  @Get('domain/:domain')
  @ApiOperation({ summary: 'Get a company by its domain' })
  @HttpCode(HttpStatus.OK)
  async findByDomain(@Param('domain') domain: string): Promise<CompanyDto> {
    return this.companiesService.findByDomain(domain);
  }

  @Post('fetch')
  @ApiOperation({
    summary:
      'Fetch companies from external APIs (Wikidata and/or CompanyEnrich)',
    description:
      'Fetches company data from external APIs and optionally saves to database',
  })
  @HttpCode(HttpStatus.OK)
  async fetchFromApis(
    @Query({
      schema: fetchCompaniesQuerySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    options: FetchCompaniesQuery,
    @Body({
      schema: companySearchBodySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    params: CompanySearchParams,
  ): Promise<NormalizedCompany[]> {
    return this.companiesService.fetchFromApis({
      ...options,
      params: params,
    });
  }

  @Post('fetch/wikidata')
  @ApiOperation({
    summary: 'Fetch companies from Wikidata',
    description: 'Fetches company data from Wikidata only',
  })
  @HttpCode(HttpStatus.OK)
  async fetchFromWikidata(
    @Body({
      schema: companySearchBodySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    params: CompanySearchParams,
  ): Promise<NormalizedCompany[]> {
    return this.companiesService.fetchFromWikidata(params);
  }

  @Post('fetch/company-enrich')
  @ApiOperation({
    summary: 'Fetch companies from CompanyEnrich',
    description: 'Fetches company data from CompanyEnrich only',
  })
  @HttpCode(HttpStatus.OK)
  async fetchFromCompanyEnrich(
    @Body({
      schema: companySearchBodySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    params: CompanySearchParams,
  ): Promise<NormalizedCompany[]> {
    return this.companiesService.fetchFromCompanyEnrich(params);
  }

  @Post()
  @ApiOperation({ summary: 'Create a company directly' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body({
      schema: createCompanySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    dto: CreateCompanyRequest,
  ): Promise<CompanyDto> {
    // For direct creation, we create a normalized company manually
    const normalized = {
      name: dto.name ?? null,
      legalName: dto.legalName ?? null,
      domain: dto.domain ?? null,
      websiteUrl: dto.websiteUrl ?? null,
      companyType: dto.companyType ?? null,
      description: dto.description ?? null,
      numberOfEmployees: dto.numberOfEmployees ?? null,
      employeeRange: dto.employeeRange ?? null,
      foundingYear: dto.foundingYear ?? null,
      source: 'manual',
      externalId: null,
      rawData: null,
    };

    return this.companiesService.createFromNormalized(normalized);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh company data from external APIs',
    description: 'Fetches data from external APIs and saves to database',
  })
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Query({
      schema: fetchCompaniesQuerySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    options: FetchCompaniesQuery,
    @Body({
      schema: companySearchBodySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    params: CompanySearchParams,
  ): Promise<CompanyDto[]> {
    const companies = await this.companiesService.fetchFromApis({
      ...options,
      params: params,
      saveToDatabase: true, // Always save when using refresh endpoint
    });

    // Save all fetched companies to database
    return this.companiesService.saveAllFromNormalized(companies);
  }
}
