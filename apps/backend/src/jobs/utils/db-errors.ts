import { NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

export function jobNotFound(id: string): NotFoundException {
  return new NotFoundException(`Job "${id}" not found`);
}

export function hasPgCode(error: unknown, code: string): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }
  const driverError: unknown = error.driverError;
  return (
    typeof driverError === 'object' &&
    driverError !== null &&
    'code' in driverError &&
    driverError.code === code
  );
}
