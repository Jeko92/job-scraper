import {
  type Location,
  type LocationsQuery,
  locationsQuerySchema,
} from '@job-scraper/shared';
import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { ApiLookupQuery } from '../common/decorators/api-lookup-query.decorator.js';
import { LocationsService } from './locations.service.js';

@ApiTags('locations')
@ApiBearerAuth()
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'List locations, ordered by country, state, city' })
  @ApiLookupQuery('Case-insensitive match on the country, state or city name')
  @ApiQuery({
    name: 'countryCode',
    required: false,
    description: 'ISO 3166-1 alpha-2 code, e.g. DE',
  })
  @ApiQuery({
    name: 'state',
    required: false,
    description: 'Exact state name (case-insensitive), e.g. Bavaria',
  })
  findAll(
    @Query({
      schema: locationsQuerySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    query: LocationsQuery,
  ): Promise<Location[]> {
    return this.locationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a location by its id' })
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<Location> {
    return this.locationsService.findById(id);
  }
}
