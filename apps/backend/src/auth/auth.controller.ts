import type { PublicUser, RegisterRequest } from '@job-scraper/shared';
import { Body, Controller, Post } from '@nestjs/common';

import { UsersService } from '../users/users.service.js';
import { RegisterRequestPipe } from './register-request.pipe.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(
    @Body(RegisterRequestPipe) input: RegisterRequest,
  ): Promise<PublicUser> {
    return this.usersService.create(input);
  }
}
