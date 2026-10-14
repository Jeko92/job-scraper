import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
} from 'typeorm';

import { Company } from './company.entity.js';

@Entity('company_sources')
@Unique(['source', 'externalId'])
export class CompanySource {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Company, (company) => company.sources, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company?: Relation<Company>;

  @Column({ type: 'varchar' })
  source!: string;

  @Column({ name: 'external_id', type: 'varchar' })
  externalId!: string;

  @Column({ name: 'fetched_at', type: 'timestamptz' })
  fetchedAt!: Date;
}
