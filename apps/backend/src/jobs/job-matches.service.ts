import type { JobMatchSummary } from '@job-scraper/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EntityManager } from 'typeorm';
import { Repository } from 'typeorm';

import { UserProfile } from '../users/entities/user-profile.entity.js';
import { toUserProfileDto } from '../users/user-profile.service.js';
import { Job } from './entities/job.entity.js';
import { UserJobMatch } from './entities/user-job-match.entity.js';
import { buildMatchCriteria, scoreJob } from './matching/job-match.js';

/** Rows per INSERT, well below Postgres' bind parameter limit. */
const INSERT_CHUNK_SIZE = 1000;

@Injectable()
export class JobMatchesService {
  constructor(
    @InjectRepository(UserJobMatch)
    private readonly matchesRepository: Repository<UserJobMatch>,
  ) {}

  /** Scores every user against all active jobs and replaces all matches. */
  calculateAll(): Promise<JobMatchSummary> {
    return this.matchesRepository.manager.transaction(async (manager) => {
      const [profiles, jobs] = await Promise.all([
        this.loadProfiles(manager),
        this.loadActiveJobs(manager),
      ]);
      const calculatedAt = new Date();
      const scorableJobs = jobs.map((job) => ({
        id: job.id,
        workplaceType: job.workplaceType,
        employmentType: job.employmentType,
        locationId: job.locationId,
        skills: job.skills ?? [],
      }));

      const rows: Omit<UserJobMatch, 'user' | 'job'>[] = [];
      for (const profile of profiles) {
        const criteria = buildMatchCriteria(toUserProfileDto(profile));
        for (const job of scorableJobs) {
          const match = scoreJob(criteria, job);
          if (match !== null) {
            rows.push({
              userId: profile.userId,
              jobId: job.id,
              match,
              calculatedAt,
            });
          }
        }
      }

      await manager.createQueryBuilder().delete().from(UserJobMatch).execute();
      for (let start = 0; start < rows.length; start += INSERT_CHUNK_SIZE) {
        await manager.insert(
          UserJobMatch,
          rows.slice(start, start + INSERT_CHUNK_SIZE),
        );
      }

      return {
        users: new Set(rows.map((row) => row.userId)).size,
        jobs: jobs.length,
        matches: rows.length,
        calculatedAt: calculatedAt.toISOString(),
      };
    });
  }

  private loadProfiles(manager: EntityManager): Promise<UserProfile[]> {
    return manager.find(UserProfile, {
      relations: {
        location: true,
        preferencesLocations: { location: true },
        preferences: true,
        skills: { skill: true },
      },
    });
  }

  /** Only the columns the match needs; descriptions can be large. */
  private loadActiveJobs(manager: EntityManager): Promise<Job[]> {
    return manager.find(Job, {
      select: {
        id: true,
        workplaceType: true,
        employmentType: true,
        locationId: true,
        skills: { jobId: true, skillId: true, required: true },
      },
      where: { isActive: true },
      relations: { skills: true },
    });
  }
}
