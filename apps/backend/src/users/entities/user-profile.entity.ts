import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { decimalTransformer } from '../../db/decimal.transformer.js';
import { Location } from '../../locations/entities/location.entity.js';
import { User } from './user.entity.js';
import { UserIndustry } from './user-industry.entity.js';
import { UserPreferences } from './user-preferences.entity.js';
import { UserSkill } from './user-skill.entity.js';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Uniqueness comes from the @OneToOne join column below.
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @OneToOne(() => User, (user) => user.profile, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user?: Relation<User>;

  @Column({ name: 'first_name', type: 'varchar', nullable: true })
  firstName!: string | null;

  @Column({ name: 'last_name', type: 'varchar', nullable: true })
  lastName!: string | null;

  @Column({ type: 'varchar', nullable: true })
  headline!: string | null;

  @Column({
    name: 'years_experience',
    type: 'numeric',
    precision: 4,
    scale: 1,
    nullable: true,
    transformer: decimalTransformer,
  })
  yearsExperience!: number | null;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId!: string | null;

  @ManyToOne(() => Location, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'location_id' })
  location?: Relation<Location> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToOne(() => UserPreferences, (preferences) => preferences.userProfile)
  preferences?: Relation<UserPreferences>;

  @OneToMany(() => UserSkill, (userSkill) => userSkill.userProfile)
  skills?: Relation<UserSkill>[];

  @OneToMany(() => UserIndustry, (userIndustry) => userIndustry.userProfile)
  industries?: Relation<UserIndustry>[];
}
