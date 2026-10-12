import {
  type Skill,
  type SkillsQuery,
  skillsQuerySchema,
} from '@job-scraper/shared';
import {
  Controller,
  Get,
  Param,
  Query,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ApiLookupQuery } from '../common/decorators/api-lookup-query.decorator.js';
import { SkillsService } from './skills.service.js';

@ApiTags('skills')
@ApiBearerAuth()
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @ApiOperation({ summary: 'List skills, ordered by name' })
  @ApiLookupQuery('Case-insensitive match on the skill name')
  findAll(
    @Query({
      schema: skillsQuerySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    query: SkillsQuery,
  ): Promise<Skill[]> {
    return this.skillsService.findAll(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a skill by its slug' })
  findBySlug(@Param('slug') slug: string): Promise<Skill> {
    return this.skillsService.findBySlug(slug);
  }
}
