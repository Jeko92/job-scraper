import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';

import type { CompanyDto } from './companies.service.js';
import { CompaniesService } from './companies.service.js';
import type {
  CompanySearchParams,
  NormalizedCompany,
} from './providers/company-data-provider.js';

// Zod schemas for request validation
export const companySearchParamsSchema = z.object({
  query: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  minEmployees: z.number().int().positive().optional().nullable(),
  maxEmployees: z.number().int().positive().optional().nullable(),
  foundedAfter: z.number().int().positive().optional().nullable(),
  foundedBefore: z.number().int().positive().optional().nullable(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export const fetchCompaniesOptionsSchema = z.object({
  providers: z
    .array(z.enum(['wikidata', 'company-enrich'] as const))
    .default(['wikidata', 'company-enrich']),
  mergeResults: z.boolean().default(true),
  saveToDatabase: z.boolean().default(false),
});

export const createCompanySchema = z.object({
  name: z.string().nullable().optional(),
  legalName: z.string().nullable().optional(),
  domain: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  companyType: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  numberOfEmployees: z.number().int().positive().nullable().optional(),
  employeeRange: z.string().nullable().optional(),
  foundingYear: z.number().int().positive().nullable().optional(),
});

/**
 * Map the validated request body to CompanySearchParams, dropping null values.
 */
function toSearchParams(
  params: z.infer<typeof companySearchParamsSchema>,
): CompanySearchParams {
  return {
    query: params.query ?? undefined,
    location: params.location ?? undefined,
    industry: params.industry ?? undefined,
    minEmployees: params.minEmployees ?? undefined,
    maxEmployees: params.maxEmployees ?? undefined,
    foundedAfter: params.foundedAfter ?? undefined,
    foundedBefore: params.foundedBefore ?? undefined,
    limit: params.limit,
    offset: params.offset,
  };
}

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
      schema: companySearchParamsSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    params: CompanySearchParams,
  ): Promise<CompanyDto[]> {
    return this.companiesService.search(params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company by its ID' })
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<CompanyDto | null> {
    return this.companiesService.findById(id);
  }

  @Get('domain/:domain')
  @ApiOperation({ summary: 'Get a company by its domain' })
  @HttpCode(HttpStatus.OK)
  async findByDomain(
    @Param('domain') domain: string,
  ): Promise<CompanyDto | null> {
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
      schema: fetchCompaniesOptionsSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    options: z.infer<typeof fetchCompaniesOptionsSchema>,
    @Body({
      schema: companySearchParamsSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    params: z.infer<typeof companySearchParamsSchema>,
  ): Promise<NormalizedCompany[]> {
    return this.companiesService.fetchFromApis({
      ...options,
      params: toSearchParams(params),
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
      schema: companySearchParamsSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    params: z.infer<typeof companySearchParamsSchema>,
  ): Promise<NormalizedCompany[]> {
    return this.companiesService.fetchFromWikidata(toSearchParams(params));
  }

  @Post('fetch/company-enrich')
  @ApiOperation({
    summary: 'Fetch companies from CompanyEnrich',
    description: 'Fetches company data from CompanyEnrich only',
  })
  @HttpCode(HttpStatus.OK)
  async fetchFromCompanyEnrich(
    @Body({
      schema: companySearchParamsSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    params: z.infer<typeof companySearchParamsSchema>,
  ): Promise<NormalizedCompany[]> {
    return this.companiesService.fetchFromCompanyEnrich(toSearchParams(params));
  }

  @Post('fetch/:identifier')
  @ApiOperation({
    summary: 'Fetch a single company from external APIs by identifier',
    description:
      'Tries to fetch a company by name or domain from external APIs',
  })
  @HttpCode(HttpStatus.OK)
  async fetchCompanyByIdentifier(
    @Param('identifier') identifier: string,
    @Query('providers') providers?: string,
  ): Promise<NormalizedCompany | null> {
    const providerList: ('wikidata' | 'company-enrich')[] = providers
      ? providers
          .split(',')
          .filter(
            (p): p is 'wikidata' | 'company-enrich' =>
              p === 'wikidata' || p === 'company-enrich',
          )
      : ['wikidata', 'company-enrich'];

    return this.companiesService.fetchFromApisByIdentifier(
      identifier,
      providerList,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a company directly' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body({
      schema: createCompanySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    dto: z.infer<typeof createCompanySchema>,
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
      schema: fetchCompaniesOptionsSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    options: z.infer<typeof fetchCompaniesOptionsSchema>,
    @Body({
      schema: companySearchParamsSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    params: z.infer<typeof companySearchParamsSchema>,
  ): Promise<CompanyDto[]> {
    const companies = await this.companiesService.fetchFromApis({
      ...options,
      params: toSearchParams(params),
      saveToDatabase: true, // Always save when using refresh endpoint
    });

    // Save all fetched companies to database
    return this.companiesService.saveAllFromNormalized(companies);
  }
}
