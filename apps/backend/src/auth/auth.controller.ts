import type {
  AuthUser,
  LoginResponse,
  PublicUser,
  RegisterRequest,
} from '@job-scraper/shared';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Public } from '../common/decorators/public.decorator.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { RegisterRequestPipe } from './register-request.pipe.js';
import type { RequestWithUser } from './request-with-user.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('register')
  register(
    @Body(RegisterRequestPipe) input: RegisterRequest,
  ): Promise<PublicUser> {
    return this.usersService.create(input);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  login(@Req() request: RequestWithUser): LoginResponse {
    return this.authService.login(request.user);
  }

  @Get('me')
  me(@Req() request: RequestWithUser): AuthUser {
    return request.user;
  }
}
