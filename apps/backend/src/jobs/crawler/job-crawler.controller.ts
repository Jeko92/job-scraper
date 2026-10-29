import type { JobListItem } from '@job-scraper/shared';
import { Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator.js';
import { JobCrawlerService } from './job-crawler.service.js';

@ApiTags('jobs')
@ApiBearerAuth()
@Controller('jobs')
export class JobCrawlerController {
  constructor(private readonly jobCrawlerService: JobCrawlerService) {}

  @Post('crawl/:companyId')
  @Roles('admin')
  @ApiForbiddenResponse({ description: 'Admin only' })
  @ApiOperation({
    summary:
      "Crawl the company's website with AI and create the jobs found there",
  })
  crawl(
    @Param('companyId', ParseUUIDPipe) companyId: string,
  ): Promise<JobListItem[]> {
    return this.jobCrawlerService.crawl(companyId);
  }
}
