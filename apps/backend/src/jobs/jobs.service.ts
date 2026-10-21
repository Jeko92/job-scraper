import {
  EMPLOYMENT_TYPES,
  type JobListItem,
  REMOTE_PREFERENCES,
} from '@job-scraper/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { toLocationDto } from '../locations/locations.service.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobDto } from './dto/update-job.dto.js';
import { Job } from './entities/job.entity.js';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
  ) {}

  create(_createJobDto: CreateJobDto) {
    return 'This action adds a new job';
  }

  findAll() {
    return `This action returns all jobs`;
  }

  async findOne(id: string): Promise<JobListItem> {
    const [item] = await this.loadItems([id]);
    if (!item) {
      throw jobNotFound(id);
    }
    return item;
  }

  update(id: string, _updateJobDto: UpdateJobDto) {
    return `This action updates a #${id} job`;
  }

  remove(id: string) {
    return `This action removes a #${id} job`;
  }

  private async loadItems(ids: string[]): Promise<JobListItem[]> {
    if (ids.length === 0) {
      return [];
    }
    const jobs = await this.jobsRepository
      .createQueryBuilder('job')
      .innerJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('job.location', 'location')
      .leftJoinAndSelect('job.skills', 'jobSkill')
      .leftJoinAndSelect('jobSkill.skill', 'skill')
      .where('job.id IN (:...ids)', { ids })
      .orderBy('skill.name', 'ASC')
      .getMany();
    const byId = new Map(jobs.map((job) => [job.id, job]));
    return ids.flatMap((id) => {
      const job = byId.get(id);
      return job ? [toJobListItem(job)] : [];
    });
  }
}

function toJobListItem(job: Job): JobListItem {
  const company = job.company;
  if (!company) {
    throw new Error(`Job "${job.id}" was loaded without its company`);
  }
  return {
    id: job.id,
    title: job.title,
    company: { id: company.id, name: company.name, domain: company.domain },
    location: job.location ? toLocationDto(job.location) : null,
    workplaceType: oneOf(REMOTE_PREFERENCES, job.workplaceType),
    employmentType: oneOf(EMPLOYMENT_TYPES, job.employmentType),
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    postedAt: (job.publishedAt ?? job.firstSeenAt).toISOString(),
    skills: (job.skills ?? []).flatMap(({ skill, required }) =>
      skill
        ? [{ id: skill.id, name: skill.name, slug: skill.slug, required }]
        : [],
    ),
  };
}

function oneOf<T extends string>(
  values: readonly T[],
  value: string | null,
): T | null {
  return values.find((allowed) => allowed === value) ?? null;
}

function jobNotFound(id: string): NotFoundException {
  return new NotFoundException(`Job "${id}" not found`);
}
