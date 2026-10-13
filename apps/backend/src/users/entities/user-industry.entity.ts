import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';

import { Industry } from '../../industries/entities/industry.entity.js';
import { UserProfile } from './user-profile.entity.js';

@Entity('user_industries')
export class UserIndustry {
  @PrimaryColumn({ name: 'user_profile_id', type: 'uuid' })
  userProfileId!: string;

  @PrimaryColumn({ name: 'industry_id', type: 'uuid' })
  industryId!: string;

  @ManyToOne(() => UserProfile, (profile) => profile.industries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_profile_id' })
  userProfile?: Relation<UserProfile>;

  @ManyToOne(() => Industry, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'industry_id' })
  industry?: Relation<Industry>;

  @Column({ type: 'int', nullable: true })
  priority!: number | null;
}
