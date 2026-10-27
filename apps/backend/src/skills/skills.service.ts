import type { Skill as SkillDto, SkillsQuery } from '@job-scraper/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type EntityManager, Repository } from 'typeorm';

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

  async findOrCreate(
    name: string,
    manager: EntityManager = this.skillsRepository.manager,
  ): Promise<Skill> {
    const repository = manager.getRepository(Skill);
    const slug = toSlug(name);
    const existing = await repository
      .createQueryBuilder('skill')
      .where('skill.slug = :slug OR LOWER(skill.name) = LOWER(:name)', {
        slug,
        name,
      })
      .getOne();
    return existing ?? repository.save({ name, slug });
  }
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toSkillDto({ id, name, slug }: Skill): SkillDto {
  return { id, name, slug };
}
