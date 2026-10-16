import type { HelloResponse } from '@job-scraper/shared';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service.js';
import { Public } from './common/decorators/public.decorator.js';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check greeting' })
  getHello(): HelloResponse {
    return this.appService.getHello();
  }
}
