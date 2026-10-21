import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';

import { Skill } from '../../skills/entities/skill.entity.js';
import { Job } from './job.entity.js';

@Entity('job_skills')
@Index(['skillId', 'jobId'])
export class JobSkill {
  @PrimaryColumn({ name: 'job_id', type: 'uuid' })
  jobId!: string;

  @PrimaryColumn({ name: 'skill_id', type: 'uuid' })
  skillId!: string;

  @Column({ type: 'boolean', default: true })
  required!: boolean;

  @ManyToOne(() => Job, (job) => job.skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job?: Relation<Job>;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_id' })
  skill?: Relation<Skill>;
}
