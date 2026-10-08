import type { AuthUser } from '@job-scraper/shared';
import type { Request } from 'express';

export interface RequestWithUser extends Request {
  user: AuthUser;
}
