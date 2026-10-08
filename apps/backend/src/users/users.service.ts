import type { PublicUser, RegisterRequest } from '@job-scraper/shared';
import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';

import type { Env } from '../config/env.js';
import { User } from './entities/user.entity.js';

const UNIQUE_VIOLATION = '23505';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async create(input: RegisterRequest): Promise<PublicUser> {
    if (await this.findByUsername(input.username)) {
      throw usernameTaken(input.username);
    }

    const passwordHash = await bcrypt.hash(
      input.password,
      this.config.get('BCRYPT_SALT_ROUNDS', { infer: true }),
    );

    try {
      const user = await this.usersRepository.save(
        this.usersRepository.create({
          firstName: input.firstName,
          lastName: input.lastName,
          username: input.username,
          passwordHash,
        }),
      );
      return toPublicUser(user);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw usernameTaken(input.username);
      }
      throw error;
    }
  }

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }
}

function toPublicUser({ id, firstName, lastName, username }: User): PublicUser {
  return { id, firstName, lastName, username };
}

function usernameTaken(username: string): ConflictException {
  return new ConflictException(`Username "${username}" is already taken`);
}

function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }
  const driverError: unknown = error.driverError;
  return (
    typeof driverError === 'object' &&
    driverError !== null &&
    'code' in driverError &&
    driverError.code === UNIQUE_VIOLATION
  );
}
