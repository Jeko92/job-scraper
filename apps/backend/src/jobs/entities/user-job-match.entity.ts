import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';

import { User } from '../../users/entities/user.entity.js';
import { Job } from './job.entity.js';

/**
 * How well a job fits a user's profile (ADR-011). Rows are replaced as a
 * whole by `POST /job-matches/calculate`; no row means no match.
 */
@Entity('user_job_match')
@Index(['userId', 'match'])
export class UserJobMatch {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @PrimaryColumn({ name: 'job_id', type: 'uuid' })
  jobId!: string;

  /** 0–100. */
  @Column({ type: 'smallint' })
  match!: number;

  /** When this match was calculated. */
  @CreateDateColumn({ name: 'calculated_at', type: 'timestamptz' })
  calculatedAt!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: Relation<User>;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job?: Relation<Job>;
}
