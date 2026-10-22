import {
  EMPLOYMENT_TYPES,
  JOB_SORTS,
  type JobListItem,
  type JobsListResponse,
  type JobsQuery,
  jobsQuerySchema,
  REMOTE_PREFERENCES,
} from '@job-scraper/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import {
  type CreateJobRequest,
  createJobSchema,
} from './dto/create-job.dto.js';
import {
  type UpdateJobRequest,
  updateJobSchema,
} from './dto/update-job.dto.js';
import { JobsService } from './jobs.service.js';

@ApiTags('jobs')
@ApiBearerAuth()
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a job with its skills (by slug)' })
  create(
    @Body({ schema: createJobSchema, pipes: [StandardSchemaValidationPipe] })
    input: CreateJobRequest,
  ): Promise<JobListItem> {
    return this.jobsService.create(input);
  }

  @Post('crawl/:companyId')
  @ApiOperation({
    summary:
      "Crawl the company's website with AI and create the jobs found there",
  })
  crawl(
    @Param('companyId', ParseUUIDPipe) companyId: string,
  ): Promise<JobListItem[]> {
    return this.jobsService.crawl(companyId);
  }

  @Get()
  @ApiOperation({
    summary: 'List active jobs, newest first, filtered and paginated',
  })
  @ApiQuery({
    name: 'workplaceType',
    required: false,
    enum: REMOTE_PREFERENCES,
    isArray: true,
  })
  @ApiQuery({
    name: 'employmentType',
    required: false,
    enum: EMPLOYMENT_TYPES,
    isArray: true,
  })
  @ApiQuery({ name: 'locationId', required: false, isArray: true })
  @ApiQuery({
    name: 'skill',
    required: false,
    isArray: true,
    description: 'Skill slugs',
  })
  @ApiQuery({ name: 'postedWithinDays', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, enum: JOB_SORTS })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Starts at 1',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query({ schema: jobsQuerySchema, pipes: [StandardSchemaValidationPipe] })
    query: JobsQuery,
  ): Promise<JobsListResponse> {
    return this.jobsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job by its id' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<JobListItem> {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary:
      'Update a job (omitted fields stay unchanged, null clears; skills replace the whole list)',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body({ schema: updateJobSchema, pipes: [StandardSchemaValidationPipe] })
    input: UpdateJobRequest,
  ): Promise<JobListItem> {
    return this.jobsService.update(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a job and its skills' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.jobsService.remove(id);
  }
}
