import type { UserRole } from '@job-scraper/shared';
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../common/decorators/roles.decorator.js';
import type { RequestWithUser } from './request-with-user.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!roles || roles.length === 0) {
      return true;
    }
    const { user } = context
      .switchToHttp()
      .getRequest<Partial<RequestWithUser>>();
    return user !== undefined && roles.includes(user.role);
  }
}
