import type { DataSourceOptions } from 'typeorm';

import { Industry } from '../industries/entities/industry.entity.js';
import { Location } from '../locations/entities/location.entity.js';
import { Skill } from '../skills/entities/skill.entity.js';
import { User } from '../users/entities/user.entity.js';
import { UserIndustry } from '../users/entities/user-industry.entity.js';
import { UserPreferences } from '../users/entities/user-preferences.entity.js';
import { UserProfile } from '../users/entities/user-profile.entity.js';
import { UserRelocationLocation } from '../users/entities/user-relocation-location.entity.js';
import { UserSkill } from '../users/entities/user-skill.entity.js';

export function createDataSourceOptions(
  databaseUrl: string,
): DataSourceOptions {
  return {
    type: 'postgres',
    url: databaseUrl,
    entities: [
      User,
      UserProfile,
      UserPreferences,
      UserSkill,
      UserIndustry,
      UserRelocationLocation,
      Skill,
      Industry,
      Location,
    ],
    synchronize: false,
  };
}
