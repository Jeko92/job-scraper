import type { HelloResponse } from '@job-scraper/shared';
import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service.js';
import { Public } from './common/decorators/public.decorator.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): HelloResponse {
    return this.appService.getHello();
  }
}
