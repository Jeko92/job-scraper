import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

import {
  SOURCE_ADAPTERS,
  type SourceAdapter,
} from './adapters/source-adapter.js';
import { CompanySyncService } from './company-sync.service.js';

@Injectable()
export class CompanySyncScheduler implements OnModuleInit {
  private readonly logger = new Logger(CompanySyncScheduler.name);

  constructor(
    @Inject(SOURCE_ADAPTERS) private readonly adapters: SourceAdapter[],
    private readonly syncService: CompanySyncService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit(): void {
    for (const { name, cron } of this.adapters) {
      const job = CronJob.from({
        cronTime: cron,
        onTick: () => void this.tick(name),
      });
      this.schedulerRegistry.addCronJob(name, job);
      job.start();
      this.logger.log(`Scheduled sync of ${name} at "${cron}"`);
    }
  }

  private async tick(name: string): Promise<void> {
    if (this.syncService.isRunning(name)) {
      this.logger.warn(`Skipped scheduled sync of ${name}: still running`);
      return;
    }
    await this.syncService.run(name).catch(() => undefined);
  }
}
