import type { NestApplicationOptions } from '@nestjs/common';

export const appOptions: NestApplicationOptions = {
  forceCloseConnections: true,
};
