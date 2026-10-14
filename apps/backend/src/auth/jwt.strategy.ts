import { type AuthUser, userRoleSchema } from '@job-scraper/shared';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { z } from 'zod';

import type { Env } from '../config/env.js';

const jwtPayloadSchema = z.object({
  sub: z.string(),
  username: z.string(),
  role: userRoleSchema,
});

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<Env, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', { infer: true }),
    });
  }

  validate(payload: unknown): AuthUser {
    const result = jwtPayloadSchema.safeParse(payload);
    if (!result.success) {
      throw new UnauthorizedException();
    }
    const { sub, username, role } = result.data;
    return { id: sub, username, role };
  }
}
