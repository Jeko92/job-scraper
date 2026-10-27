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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CompaniesService } from './companies.service.js';
import type { CompanyDto } from './dto/company.dto.js';
import {
  type CreateCompanyRequest,
  createCompanySchema,
} from './dto/create-company.dto.js';
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

  @Post('wikidata/fetch')
  @ApiOperation({ summary: 'Fetch companies from Wikidata' })
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

  @Post('wikidata/refresh')
  @ApiOperation({
    summary: 'Fetch companies from Wikidata and save them to the database',
  })
  @HttpCode(HttpStatus.OK)
  async refreshFromWikidata(
    @Body({
      schema: companySearchBodySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    params: CompanySearchParams,
  ): Promise<CompanyDto[]> {
    return this.companiesService.saveAllFromNormalized(
      await this.companiesService.fetchFromWikidata(params),
    );
  }

  @Post('fetch/company-enrich')
  @ApiOperation({ summary: 'Fetch companies from CompanyEnrich' })
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
    return this.companiesService.createFromNormalized({
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
    });
  }
}
