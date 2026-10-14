import { UserRole } from '@job-scraper/shared';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator.js';
import {
  type SourceName,
  sourceNameSchema,
  type SourceStatus,
  type SyncSummary,
} from './company-sync.schemas.js';
import { CompanySyncService } from './company-sync.service.js';

@ApiTags('company-sync')
@ApiBearerAuth()
@Roles(UserRole.Admin)
@Controller('company-sync')
export class CompanySyncController {
  constructor(private readonly syncService: CompanySyncService) {}

  @Get('sources')
  @ApiOperation({
    summary: 'List company sources with their cron and running state',
  })
  listSources(): SourceStatus[] {
    return this.syncService.listSources();
  }

  @Post('sources/:name/run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run the sync of one company source now' })
  run(
    @Param('name', {
      schema: sourceNameSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    name: SourceName,
  ): Promise<SyncSummary> {
    return this.syncService.run(name);
  }
}
