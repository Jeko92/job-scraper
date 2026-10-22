import type { JobListItem } from '@job-scraper/shared';
import { Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JobCrawlerService } from './job-crawler.service.js';

@ApiTags('jobs')
@ApiBearerAuth()
@Controller('jobs')
export class JobCrawlerController {
  constructor(private readonly jobCrawlerService: JobCrawlerService) {}

  @Post('crawl/:companyId')
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
