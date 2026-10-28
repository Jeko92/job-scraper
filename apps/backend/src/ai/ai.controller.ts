import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator.js';
import { AiService } from './ai.service.js';
import {
  type SupplementRequest,
  supplementRequestSchema,
  type SupplementResponse,
} from './supplement-request.js';

@ApiTags('ai')
@ApiBearerAuth()
@Roles('admin')
@ApiForbiddenResponse({ description: 'Admin only' })
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('supplement')
  @ApiOperation({ summary: 'Fill in missing JSON values with AI' })
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
