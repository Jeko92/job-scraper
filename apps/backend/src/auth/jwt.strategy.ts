import { type AuthUser, userRoleSchema } from '@job-scraper/shared';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { Env } from '../config/env.js';

interface JwtPayload {
  sub: string;
  username: string;
  // Tokens issued before roles existed have none, so it is checked below.
  role?: unknown;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<Env, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', { infer: true }),
    });
  }

  validate(payload: JwtPayload): AuthUser {
    const role = userRoleSchema.safeParse(payload.role);
    if (!role.success) {
      throw new UnauthorizedException('Token has no valid role, log in again');
    }
    return { id: payload.sub, username: payload.username, role: role.data };
  }
}
