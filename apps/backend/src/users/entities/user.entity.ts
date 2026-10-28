import {
  DEFAULT_USER_ROLE,
  USER_ROLES,
  type UserRole,
} from '@job-scraper/shared';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UserProfile } from './user-profile.entity.js';

@Entity('users')
@Check(
  'CHK_users_role',
  `"role" IN (${USER_ROLES.map((role) => `'${role}'`).join(', ')})`,
)
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email!: string | null;

  @Column({ unique: true })
  username!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 20, default: DEFAULT_USER_ROLE })
  role!: UserRole;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToOne(() => UserProfile, (profile) => profile.user)
  profile?: Relation<UserProfile>;
}
