import { BadRequestException } from '@nestjs/common';
import { type EntityManager, In } from 'typeorm';

import { Skill } from '../../skills/entities/skill.entity.js';
import type { JobSkillInput } from '../dto/create-job.dto.js';
import { JobSkill } from '../entities/job-skill.entity.js';

export async function replaceSkills(
  manager: EntityManager,
  jobId: string,
  skills: JobSkillInput[],
): Promise<void> {
  const slugs = skills.map(({ slug }) => slug);
  const found =
    slugs.length > 0
      ? await manager.find(Skill, { where: { slug: In(slugs) } })
      : [];
  const idBySlug = new Map(found.map((skill) => [skill.slug, skill.id]));
  const unknown = slugs.filter((slug) => !idBySlug.has(slug));
  if (unknown.length > 0) {
    throw new BadRequestException(`Unknown skills: ${unknown.join(', ')}`);
  }

  await manager.delete(JobSkill, { jobId });
  const rows = skills.flatMap(({ slug, required }) => {
    const skillId = idBySlug.get(slug);
    return skillId ? [{ jobId, skillId, required: required ?? true }] : [];
  });
  if (rows.length > 0) {
    await manager.insert(JobSkill, rows);
  }
}
