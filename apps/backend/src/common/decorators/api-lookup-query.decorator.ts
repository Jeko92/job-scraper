import { DEFAULT_LOOKUP_LIMIT, MAX_LOOKUP_LIMIT } from '@job-scraper/shared';
import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

/** Swagger docs for the `search` and `limit` filters every lookup list shares. */
export function ApiLookupQuery(searchDescription: string): MethodDecorator {
  return applyDecorators(
    ApiQuery({
      name: 'search',
      required: false,
      description: searchDescription,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: `Maximum number of results (default ${String(DEFAULT_LOOKUP_LIMIT)}, max ${String(MAX_LOOKUP_LIMIT)})`,
    }),
  );
}
