import {
  EMPLOYMENT_TYPES,
  REMOTE_PREFERENCES,
  SKILL_LEVELS,
  type UpdateUserProfileRequest,
  type UserProfile as UserProfileDto,
} from '@job-scraper/shared';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type EntityManager, type EntityTarget, In, Repository } from 'typeorm';

import { Industry } from '../industries/entities/industry.entity.js';
import { Location } from '../locations/entities/location.entity.js';
import { toLocationDto } from '../locations/locations.service.js';
import { Skill } from '../skills/entities/skill.entity.js';
import { UserIndustry } from './entities/user-industry.entity.js';
import { UserPreferences } from './entities/user-preferences.entity.js';
import { UserProfile } from './entities/user-profile.entity.js';
import { UserSkill } from './entities/user-skill.entity.js';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly profilesRepository: Repository<UserProfile>,
  ) {}

  async getByUserId(userId: string): Promise<UserProfileDto> {
    const profile = await this.profilesRepository.findOne({
      where: { userId },
      relations: {
        location: true,
        preferences: true,
        skills: { skill: true },
        industries: { industry: true },
      },
    });
    if (!profile) {
      throw profileNotFound();
    }
    return toUserProfileDto(profile);
  }

  async update(
    userId: string,
    input: UpdateUserProfileRequest,
  ): Promise<UserProfileDto> {
    await this.profilesRepository.manager.transaction(async (manager) => {
      const profile = await manager.findOneBy(UserProfile, { userId });
      if (!profile) {
        throw profileNotFound();
      }
      const { skills, industries, preferences, ...basics } = input;

      if (
        basics.locationId &&
        !(await manager.existsBy(Location, { id: basics.locationId }))
      ) {
        throw new BadRequestException(`Unknown location: ${basics.locationId}`);
      }
      // Always touch updated_at, also when only skills/industries change.
      await manager.update(UserProfile, profile.id, {
        ...definedOnly(basics),
        updatedAt: new Date(),
      });

      if (skills) {
        const skillIds = await resolveSlugs(
          manager,
          Skill,
          skills.map((skill) => skill.slug),
          'skills',
        );
        await manager.delete(UserSkill, { userProfileId: profile.id });
        const rows = skills.flatMap((skill) => {
          const skillId = skillIds.get(skill.slug);
          return skillId
            ? [
                {
                  userProfileId: profile.id,
                  skillId,
                  level: skill.level ?? null,
                  yearsExperience: skill.yearsExperience ?? null,
                },
              ]
            : [];
        });
        if (rows.length > 0) {
          await manager.insert(UserSkill, rows);
        }
      }

      if (industries) {
        const industryIds = await resolveSlugs(
          manager,
          Industry,
          industries,
          'industries',
        );
        await manager.delete(UserIndustry, { userProfileId: profile.id });
        // Array order sets the priority: first industry = 1.
        const rows = industries.flatMap((slug, index) => {
          const industryId = industryIds.get(slug);
          return industryId
            ? [{ userProfileId: profile.id, industryId, priority: index + 1 }]
            : [];
        });
        if (rows.length > 0) {
          await manager.insert(UserIndustry, rows);
        }
      }

      if (preferences) {
        const existing = await manager.findOneBy(UserPreferences, {
          userProfileId: profile.id,
        });
        await manager.save(
          Object.assign(
            existing ??
              manager.create(UserPreferences, { userProfileId: profile.id }),
            definedOnly(preferences),
          ),
        );
      }
    });

    return this.getByUserId(userId);
  }
}

/**
 * Maps slugs to ids, rejecting the request when any slug is unknown. Lookup
 * values are admin-managed, so they are never created here.
 */
async function resolveSlugs(
  manager: EntityManager,
  entity: EntityTarget<{ id: string; slug: string }>,
  slugs: string[],
  label: string,
): Promise<Map<string, string>> {
  const rows =
    slugs.length > 0
      ? await manager.find(entity, { where: { slug: In(slugs) } })
      : [];
  const idBySlug = new Map(rows.map((row) => [row.slug, row.id]));
  const unknown = slugs.filter((slug) => !idBySlug.has(slug));
  if (unknown.length > 0) {
    throw new BadRequestException(`Unknown ${label}: ${unknown.join(', ')}`);
  }
  return idBySlug;
}

type DefinedOnly<T> = { [K in keyof T]?: Exclude<T[K], undefined> };

/** Drops omitted fields so they stay unchanged; `null` still clears. */
function definedOnly<T extends object>(value: T): DefinedOnly<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as DefinedOnly<T>;
}

/** Narrows a varchar column to the shared enum; unexpected values become null. */
function oneOf<T extends string>(
  values: readonly T[],
  value: string | null,
): T | null {
  return values.find((allowed) => allowed === value) ?? null;
}

function toUserProfileDto(profile: UserProfile): UserProfileDto {
  const { preferences } = profile;
  return {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    headline: profile.headline,
    yearsExperience: profile.yearsExperience,
    location: profile.location ? toLocationDto(profile.location) : null,
    skills: (profile.skills ?? [])
      .flatMap(({ skill, level, yearsExperience }) =>
        skill
          ? [
              {
                id: skill.id,
                name: skill.name,
                slug: skill.slug,
                level: oneOf(SKILL_LEVELS, level),
                yearsExperience,
              },
            ]
          : [],
      )
      .sort((a, b) => a.name.localeCompare(b.name)),
    industries: (profile.industries ?? [])
      .flatMap(({ industry, priority }) =>
        industry
          ? [
              {
                id: industry.id,
                name: industry.name,
                slug: industry.slug,
                priority,
              },
            ]
          : [],
      )
      .sort(
        (a, b) =>
          (a.priority ?? Number.MAX_SAFE_INTEGER) -
          (b.priority ?? Number.MAX_SAFE_INTEGER),
      ),
    preferences: preferences
      ? {
          remotePreference: oneOf(
            REMOTE_PREFERENCES,
            preferences.remotePreference,
          ),
          employmentType: oneOf(EMPLOYMENT_TYPES, preferences.employmentType),
          minSalary: preferences.minSalary,
          salaryCurrency: preferences.salaryCurrency,
          willingToRelocate: preferences.willingToRelocate,
        }
      : null,
    updatedAt: profile.updatedAt.toISOString(),
  };
}

function profileNotFound(): NotFoundException {
  return new NotFoundException('Profile not found');
}
