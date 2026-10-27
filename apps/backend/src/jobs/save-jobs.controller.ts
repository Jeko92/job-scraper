import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { RequestWithUser } from '../auth/request-with-user.js';
import { JobsService } from './jobs.service.js';

/** Saving jobs; list them with `GET /jobs?saved=true`. */
@ApiTags('jobs')
@ApiBearerAuth()
@Controller('users/me/save-jobs')
export class SaveJobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Put(':jobId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Save a job (saving it again does nothing)' })
  save(
    @Req() request: RequestWithUser,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ): Promise<void> {
    return this.jobsService.save(jobId, request.user.id);
  }

  @Delete(':jobId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unsave a job (does nothing if not saved)' })
  unsave(
    @Req() request: RequestWithUser,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ): Promise<void> {
    return this.jobsService.unsave(jobId, request.user.id);
  }
}
