import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  StandardSchemaValidationPipe,
} from '@nestjs/common';

import { AiService } from './ai.service.js';
import {
  type SupplementRequest,
  supplementRequestSchema,
  type SupplementResponse,
} from './supplement-request.js';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('supplement')
  @HttpCode(HttpStatus.OK)
  supplement(
    @Body({
      schema: supplementRequestSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    input: SupplementRequest,
  ): Promise<SupplementResponse> {
    return this.aiService.supplement(input);
  }
}
