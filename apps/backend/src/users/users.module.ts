import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity.js';
import { UserProfile } from './entities/user-profile.entity.js';
import { UserProfileController } from './user-profile.controller.js';
import { UserProfileService } from './user-profile.service.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile])],
  controllers: [UserProfileController],
  providers: [UsersService, UserProfileService],
  exports: [UsersService],
})
export class UsersModule {}
