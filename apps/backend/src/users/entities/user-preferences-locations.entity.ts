import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';

import { Location } from '../../locations/entities/location.entity.js';
import { UserProfile } from './user-profile.entity.js';

@Entity('user_preferences_locations')
export class UserPreferencesLocation {
  @PrimaryColumn({ name: 'user_profile_id', type: 'uuid' })
  userProfileId!: string;

  @PrimaryColumn({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @ManyToOne(() => UserProfile, (profile) => profile.preferencesLocations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_profile_id' })
  userProfile?: Relation<UserProfile>;

  @ManyToOne(() => Location, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location?: Relation<Location>;
}
