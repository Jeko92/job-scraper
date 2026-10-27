import type {
  Location as LocationDto,
  LocationsQuery,
} from '@job-scraper/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type EntityManager, IsNull, Repository } from 'typeorm';

import { containsPattern } from '../common/contains-pattern.js';
import { Location } from './entities/location.entity.js';

export type NewLocation = Omit<Location, 'id'>;

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationsRepository: Repository<Location>,
  ) {}

  async findAll({
    search,
    countryCode,
    state,
    limit,
  }: LocationsQuery): Promise<LocationDto[]> {
    const query = this.locationsRepository
      .createQueryBuilder('location')
      .orderBy('location.countryName', 'ASC', 'NULLS FIRST')
      .addOrderBy('location.stateName', 'ASC', 'NULLS FIRST')
      .addOrderBy('location.city', 'ASC', 'NULLS FIRST')
      .limit(limit);
    if (search) {
      query.andWhere(
        '(location.countryName ILIKE :pattern OR location.stateName ILIKE :pattern OR location.city ILIKE :pattern)',
        { pattern: containsPattern(search) },
      );
    }
    if (countryCode) {
      query.andWhere('location.countryCode = :countryCode', { countryCode });
    }
    if (state) {
      query.andWhere('LOWER(location.stateName) = LOWER(:state)', { state });
    }
    return (await query.getMany()).map(toLocationDto);
  }

  async findById(id: string): Promise<LocationDto> {
    const location = await this.locationsRepository.findOneBy({ id });
    if (!location) {
      throw new NotFoundException(`Location "${id}" not found`);
    }
    return toLocationDto(location);
  }

  async findOrCreate(
    location: NewLocation,
    manager: EntityManager = this.locationsRepository.manager,
  ): Promise<Location> {
    const repository = manager.getRepository(Location);
    const existing = await repository.findOneBy({
      countryCode: location.countryCode ?? IsNull(),
      countryName: location.countryName ?? IsNull(),
      stateName: location.stateName ?? IsNull(),
      city: location.city ?? IsNull(),
      postalCode: location.postalCode ?? IsNull(),
    });
    return existing ?? repository.save(location);
  }
}

export function toLocationDto({
  id,
  countryCode,
  countryName,
  stateName,
  city,
  postalCode,
}: Location): LocationDto {
  return { id, countryCode, countryName, stateName, city, postalCode };
}
