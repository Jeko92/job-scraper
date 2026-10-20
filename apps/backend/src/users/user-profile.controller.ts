import {
  type UpdateUserProfileRequest,
  updateUserProfileSchema,
  type UserProfile,
} from '@job-scraper/shared';
import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { RequestWithUser } from '../auth/request-with-user.js';
import { UserProfileService } from './user-profile.service.js';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users/me/profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get()
  @ApiOperation({ summary: "Get the current user's profile" })
  get(@Req() request: RequestWithUser): Promise<UserProfile> {
    return this.userProfileService.getByUserId(request.user.id);
  }

  @Patch()
  @ApiOperation({
    summary:
      'Update basic information, skills, industries, preferences locations and preferences (omitted fields stay unchanged; skills/industries/preferencesLocationIds replace the whole list)',
  })
  update(
    @Req() request: RequestWithUser,
    @Body({
      schema: updateUserProfileSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    input: UpdateUserProfileRequest,
  ): Promise<UserProfile> {
    return this.userProfileService.update(request.user.id, input);
  }
}
