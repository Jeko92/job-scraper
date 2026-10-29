import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiProviderModule } from '../common/ai/ai-provider.module.js';
import { Company } from '../companies/entities/company.entity.js';
import { LocationsModule } from '../locations/locations.module.js';
import { SkillsModule } from '../skills/skills.module.js';
import { JobCrawlerController } from './crawler/job-crawler.controller.js';
import { JobCrawlerService } from './crawler/job-crawler.service.js';
import { Job } from './entities/job.entity.js';
import { UserJobMatch } from './entities/user-job-match.entity.js';
import { UserSavedJob } from './entities/user-saved-job.entity.js';
import { JobMatchesController } from './job-matches.controller.js';
import { JobMatchesService } from './job-matches.service.js';
import { JobPreviewsController } from './job-previews.controller.js';
import { JobPreviewsService } from './job-previews.service.js';
import { JobsController } from './jobs.controller.js';
import { JobsService } from './jobs.service.js';
import { SaveJobsController } from './save-jobs.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, Company, UserSavedJob, UserJobMatch]),
    AiProviderModule,
    LocationsModule,
    SkillsModule,
  ],
  controllers: [
    JobsController,
    JobCrawlerController,
    SaveJobsController,
    JobMatchesController,
    JobPreviewsController,
  ],
  providers: [
    JobsService,
    JobCrawlerService,
    JobMatchesService,
    JobPreviewsService,
  ],
})
export class JobsModule {}
