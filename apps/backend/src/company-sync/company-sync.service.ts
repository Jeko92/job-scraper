import {
  BadGatewayException,
  ConflictException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import {
  SOURCE_ADAPTERS,
  type SourceAdapter,
} from './adapters/source-adapter.js';
import type {
  SourceName,
  SourceStatus,
  SyncSummary,
} from './company-sync.schemas.js';
import { CompanyWriter } from './company-writer.service.js';
import {
  dedupeByDomain,
  type NormalizedCompany,
  normalizedCompanySchema,
} from './normalized-company.js';

@Injectable()
export class CompanySyncService {
  private readonly logger = new Logger(CompanySyncService.name);
  private readonly running = new Set<string>();

  constructor(
    @Inject(SOURCE_ADAPTERS) private readonly adapters: SourceAdapter[],
    private readonly writer: CompanyWriter,
  ) {}

  listSources(): SourceStatus[] {
    return this.adapters.map(({ name, cron }) => ({
      name,
      cron,
      running: this.isRunning(name),
    }));
  }

  isRunning(name: string): boolean {
    return this.running.has(name);
  }

  async run(name: SourceName): Promise<SyncSummary> {
    const adapter = this.adapters.find((candidate) => candidate.name === name);
    if (!adapter) {
      throw new NotFoundException(`Unknown source "${name}"`);
    }
    if (this.isRunning(name)) {
      throw new ConflictException(`Source "${name}" is already running`);
    }

    this.running.add(name);
    const startedAt = performance.now();
    try {
      const summary = await this.sync(adapter);
      const result = {
        ...summary,
        durationMs: Math.round(performance.now() - startedAt),
      };
      this.logger.log(
        `Synced ${name}: ${String(result.fetched)} fetched, ${String(result.upserted)} upserted, ${String(result.skipped)} skipped in ${String(result.durationMs)} ms`,
      );
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        `Sync of ${name} failed`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new BadGatewayException(`Sync of source "${name}" failed`, {
        cause: error,
      });
    } finally {
      this.running.delete(name);
    }
  }

  private async sync(
    adapter: SourceAdapter,
  ): Promise<Omit<SyncSummary, 'durationMs'>> {
    const summary = {
      source: adapter.name,
      fetched: 0,
      upserted: 0,
      skipped: 0,
    };
    for await (const raw of adapter.fetchBatches()) {
      const candidates = adapter.normalize(raw);
      const valid = candidates.flatMap((candidate): NormalizedCompany[] => {
        const result = normalizedCompanySchema.safeParse(candidate);
        return result.success ? [result.data] : [];
      });
      const companies = dedupeByDomain(valid);
      await this.writer.upsert(companies);
      summary.fetched += candidates.length;
      summary.skipped += candidates.length - valid.length;
      summary.upserted += companies.length;
    }
    return summary;
  }
}
