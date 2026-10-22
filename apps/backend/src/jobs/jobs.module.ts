import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiProviderModule } from '../common/ai/ai-provider.module.js';
import { Company } from '../companies/entities/company.entity.js';
import { Job } from './entities/job.entity.js';
import { JobsController } from './jobs.controller.js';
import { JobsService } from './jobs.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Company]), AiProviderModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
