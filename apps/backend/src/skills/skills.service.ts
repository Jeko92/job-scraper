import type { Skill as SkillDto, SkillsQuery } from '@job-scraper/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { containsPattern } from '../common/contains-pattern.js';
import { Skill } from './entities/skill.entity.js';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  async findAll({ search, limit }: SkillsQuery): Promise<SkillDto[]> {
    const query = this.skillsRepository
      .createQueryBuilder('skill')
      .orderBy('skill.name', 'ASC')
      .limit(limit);
    if (search) {
      query.where('skill.name ILIKE :pattern', {
        pattern: containsPattern(search),
      });
    }
    return (await query.getMany()).map(toSkillDto);
  }

  async findBySlug(slug: string): Promise<SkillDto> {
    const skill = await this.skillsRepository.findOneBy({ slug });
    if (!skill) {
      throw new NotFoundException(`Skill "${slug}" not found`);
    }
    return toSkillDto(skill);
  }
}

function toSkillDto({ id, name, slug }: Skill): SkillDto {
  return { id, name, slug };
}
