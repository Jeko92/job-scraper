import {
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

/** A job a user has saved to their personal list. */
@Entity('user_saved_jobs')
@Index(['userId', 'createdAt'])
export class UserSavedJob {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @PrimaryColumn({ name: 'job_id', type: 'uuid' })
  jobId!: string;

  /** When the job was saved. */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: Relation<User>;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job?: Relation<Job>;
}
