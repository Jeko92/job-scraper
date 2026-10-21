import type { DataSourceOptions } from 'typeorm';

import { Company } from '../companies/entities/company.entity.js';
import { CompanyIndustry } from '../companies/entities/company-industry.entity.js';
import { CompanyLocation } from '../companies/entities/company-location.entity.js';
import { CompanySkill } from '../companies/entities/company-skill.entity.js';
import { Industry } from '../industries/entities/industry.entity.js';
import { Job } from '../jobs/entities/job.entity.js';
import { JobSkill } from '../jobs/entities/job-skill.entity.js';
import { Location } from '../locations/entities/location.entity.js';
import { Skill } from '../skills/entities/skill.entity.js';
import { User } from '../users/entities/user.entity.js';
import { UserIndustry } from '../users/entities/user-industry.entity.js';
import { UserPreferences } from '../users/entities/user-preferences.entity.js';
import { UserPreferencesLocation } from '../users/entities/user-preferences-locations.entity.js';
import { UserProfile } from '../users/entities/user-profile.entity.js';
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
      UserPreferencesLocation,
      Skill,
      Industry,
      Location,
      Company,
      CompanyLocation,
      CompanySkill,
      CompanyIndustry,
      Job,
      JobSkill,
    ],
    synchronize: false,
  };
}
