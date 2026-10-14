import type { CompanyCandidate } from '../normalized-company.js';

export const SOURCE_ADAPTERS = Symbol('SOURCE_ADAPTERS');

export abstract class SourceAdapter {
  abstract readonly name: string;
  abstract readonly cron: string;

  abstract fetchBatches(): AsyncIterable<unknown>;

  abstract normalize(raw: unknown): CompanyCandidate[];
}
