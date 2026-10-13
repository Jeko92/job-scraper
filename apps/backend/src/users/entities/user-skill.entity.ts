import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';

import { decimalTransformer } from '../../db/decimal.transformer.js';
import { Skill } from '../../skills/entities/skill.entity.js';
import { UserProfile } from './user-profile.entity.js';

@Entity('user_skills')
export class UserSkill {
  @PrimaryColumn({ name: 'user_profile_id', type: 'uuid' })
  userProfileId!: string;

  @PrimaryColumn({ name: 'skill_id', type: 'uuid' })
  skillId!: string;

  @ManyToOne(() => UserProfile, (profile) => profile.skills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_profile_id' })
  userProfile?: Relation<UserProfile>;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_id' })
  skill?: Relation<Skill>;

  @Column({ type: 'varchar', nullable: true })
  level!: string | null;

  @Column({
    name: 'years_experience',
    type: 'numeric',
    precision: 4,
    scale: 1,
    nullable: true,
    transformer: decimalTransformer,
  })
  yearsExperience!: number | null;
}
