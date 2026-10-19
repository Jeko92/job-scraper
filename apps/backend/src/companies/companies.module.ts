import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompaniesController } from './companies.controller.js';
import { CompaniesService } from './companies.service.js';
import { Company } from './entities/company.entity.js';
import { CompanyEnrichProvider } from './providers/company-enrich.provider.js';
import { WikidataProvider } from './providers/wikidata.provider.js';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Company])],
  controllers: [CompaniesController],
  providers: [CompaniesService, WikidataProvider, CompanyEnrichProvider],
  exports: [CompaniesService],
})
export class CompaniesModule {}
