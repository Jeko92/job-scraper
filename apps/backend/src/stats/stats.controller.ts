import type { UserStats } from '@job-scraper/shared';
import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { RequestWithUser } from '../auth/request-with-user.js';
import { StatsService } from './stats.service.js';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users/me/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({
    summary:
      "Get job market statistics for the current user's fields for the home page",
  })
  get(@Req() request: RequestWithUser): Promise<UserStats> {
    return this.statsService.getForUser(request.user.id);
  }
}
