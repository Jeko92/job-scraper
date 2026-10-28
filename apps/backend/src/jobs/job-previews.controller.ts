import {
  type JobsPreviewQuery,
  jobsPreviewQuerySchema,
  type JobsPreviewResponse,
  PREVIEW_CITIES,
  PREVIEW_SKILLS,
} from '@job-scraper/shared';
import {
  Controller,
  Get,
  Query,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { Public } from '../common/decorators/public.decorator.js';
import { JobPreviewsService } from './job-previews.service.js';

/** Public teaser of the jobs for prospects; logged-in users use `GET /jobs`. */
@ApiTags('jobs')
@Controller('job-previews')
export class JobPreviewsController {
  constructor(private readonly jobPreviewsService: JobPreviewsService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Newest 7 active jobs and the total, no login needed',
  })
  @ApiQuery({
    name: 'skill',
    required: false,
    enum: PREVIEW_SKILLS,
    isArray: true,
    description: 'Skill slugs',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    enum: PREVIEW_CITIES,
    isArray: true,
  })
  preview(
    @Query({
      schema: jobsPreviewQuerySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    query: JobsPreviewQuery,
  ): Promise<JobsPreviewResponse> {
    return this.jobPreviewsService.preview(query);
  }
}
