import type { HelloResponse } from '@job-scraper/shared';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): HelloResponse {
    return { message: 'hello from backend' };
  }
}
