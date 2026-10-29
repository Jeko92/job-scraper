import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Company } from '../companies/entities/company.entity.js';
import { Job } from '../jobs/entities/job.entity.js';
import { UserIndustry } from '../users/entities/user-industry.entity.js';
import { StatsController } from './stats.controller.js';
import { StatsService } from './stats.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Company, UserIndustry])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
