import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Industry } from './entities/industry.entity.js';
import { IndustriesController } from './industries.controller.js';
import { IndustriesService } from './industries.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Industry])],
  controllers: [IndustriesController],
  providers: [IndustriesService],
})
export class IndustriesModule {}
