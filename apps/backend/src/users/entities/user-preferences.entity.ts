import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { decimalTransformer } from '../../db/decimal.transformer.js';
import { UserProfile } from './user-profile.entity.js';

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Uniqueness comes from the @OneToOne join column below.
  @Column({ name: 'user_profile_id', type: 'uuid' })
  userProfileId!: string;

  @OneToOne(() => UserProfile, (profile) => profile.preferences, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_profile_id' })
  userProfile?: Relation<UserProfile>;

  @Column({
    name: 'remote_preference',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  remotePreference!: string | null;

  @Column({
    name: 'employment_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  employmentType!: string | null;

  @Column({
    name: 'min_salary',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  minSalary!: number | null;

  @Column({ name: 'salary_currency', type: 'char', length: 3, nullable: true })
  salaryCurrency!: string | null;

  @Column({ name: 'willing_to_relocate', type: 'boolean', default: false })
  willingToRelocate!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
