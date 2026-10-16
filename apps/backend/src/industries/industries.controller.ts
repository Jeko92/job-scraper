import {
  type IndustriesQuery,
  industriesQuerySchema,
  type Industry,
} from '@job-scraper/shared';
import {
  Controller,
  Get,
  Param,
  Query,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ApiLookupQuery } from '../common/decorators/api-lookup-query.decorator.js';
import { IndustriesService } from './industries.service.js';

@ApiTags('industries')
@ApiBearerAuth()
@Controller('industries')
export class IndustriesController {
  constructor(private readonly industriesService: IndustriesService) {}

  @Get()
  @ApiOperation({ summary: 'List industries, ordered by name' })
  @ApiLookupQuery('Case-insensitive match on the industry name')
  findAll(
    @Query({
      schema: industriesQuerySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    query: IndustriesQuery,
  ): Promise<Industry[]> {
    return this.industriesService.findAll(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get an industry by its slug' })
  findBySlug(@Param('slug') slug: string): Promise<Industry> {
    return this.industriesService.findBySlug(slug);
  }
}
