import type { JobMatchSummary } from '@job-scraper/shared';
import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JobMatchesService } from './job-matches.service.js';

/** Fills `user_job_match`; read the matches via `GET /jobs` (ADR-010). */
@ApiTags('jobs')
@ApiBearerAuth()
@Controller('job-matches')
export class JobMatchesController {
  constructor(private readonly jobMatchesService: JobMatchesService) {}

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate the job matches of all users (replaces all rows)',
  })
  calculate(): Promise<JobMatchSummary> {
    return this.jobMatchesService.calculateAll();
  }
}
