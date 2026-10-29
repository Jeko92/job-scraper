import type {
  IndustriesQuery,
  Industry as IndustryDto,
} from '@job-scraper/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type EntityManager, Repository } from 'typeorm';

import { containsPattern } from '../common/contains-pattern.js';
import { Industry } from './entities/industry.entity.js';

@Injectable()
export class IndustriesService {
  constructor(
    @InjectRepository(Industry)
    private readonly industriesRepository: Repository<Industry>,
  ) {}

  async findAll({ search, limit }: IndustriesQuery): Promise<IndustryDto[]> {
    const query = this.industriesRepository
      .createQueryBuilder('industry')
      .orderBy('industry.name', 'ASC')
      .limit(limit);
    if (search) {
      query.where('industry.name ILIKE :pattern', {
        pattern: containsPattern(search),
      });
    }
    return (await query.getMany()).map(toIndustryDto);
  }

  async findBySlug(slug: string): Promise<IndustryDto> {
    const industry = await this.industriesRepository.findOneBy({ slug });
    if (!industry) {
      throw new NotFoundException(`Industry "${slug}" not found`);
    }
    return toIndustryDto(industry);
  }

  async findOrCreate(
    name: string,
    manager: EntityManager = this.industriesRepository.manager,
  ): Promise<Industry> {
    const repository = manager.getRepository(Industry);
    const slug = toSlug(name);
    const existing = await repository
      .createQueryBuilder('industry')
      .where('industry.slug = :slug OR LOWER(industry.name) = LOWER(:name)', {
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

function toIndustryDto({ id, name, slug }: Industry): IndustryDto {
  return { id, name, slug };
}
