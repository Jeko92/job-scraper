import { Module } from '@nestjs/common';

import { CompanyEnrichAdapter } from './adapters/companyenrich/companyenrich.adapter.js';
import {
  SOURCE_ADAPTERS,
  type SourceAdapter,
} from './adapters/source-adapter.js';
import { WikidataAdapter } from './adapters/wikidata/wikidata.adapter.js';
import { CompanySyncController } from './company-sync.controller.js';
import { CompanySyncScheduler } from './company-sync.scheduler.js';
import { CompanySyncService } from './company-sync.service.js';
import { CompanyWriter } from './company-writer.service.js';

const ADAPTERS = [WikidataAdapter, CompanyEnrichAdapter];

@Module({
  controllers: [CompanySyncController],
  providers: [
    ...ADAPTERS,
    {
      provide: SOURCE_ADAPTERS,
      inject: ADAPTERS,
      useFactory: (...adapters: SourceAdapter[]) => adapters,
    },
    CompanyWriter,
    CompanySyncService,
    CompanySyncScheduler,
  ],
})
export class CompanySyncModule {}
