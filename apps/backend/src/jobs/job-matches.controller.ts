import type { JobMatchSummary } from '@job-scraper/shared';
import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator.js';
import { JobMatchesService } from './job-matches.service.js';

/** Fills `user_job_match`; read the matches via `GET /jobs` (ADR-011). */
@ApiTags('jobs')
@ApiBearerAuth()
@Controller('job-matches')
export class JobMatchesController {
  constructor(private readonly jobMatchesService: JobMatchesService) {}

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiForbiddenResponse({ description: 'Admin only' })
  @ApiOperation({
    summary: 'Calculate the job matches of all users (replaces all rows)',
  })
  calculate(): Promise<JobMatchSummary> {
    return this.jobMatchesService.calculateAll();
  }
}
