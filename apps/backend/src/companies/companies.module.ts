import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Company } from './entities/company.entity.js';
import { CompanyIndustry } from './entities/company-industry.entity.js';
import { CompanyLocation } from './entities/company-location.entity.js';
import { CompanySkill } from './entities/company-skill.entity.js';
import { CompanySource } from './entities/company-source.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      CompanySource,
      CompanyLocation,
      CompanyIndustry,
      CompanySkill,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class CompaniesModule {}
