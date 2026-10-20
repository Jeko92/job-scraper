import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';

import { Location } from '../../locations/entities/location.entity.js';
import { Company } from './company.entity.js';

@Entity('company_locations')
export class CompanyLocation {
  @PrimaryColumn({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @PrimaryColumn({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @ManyToOne(() => Company, (company) => company.locations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company?: Relation<Company>;

  @ManyToOne(() => Location, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location?: Relation<Location>;
}
