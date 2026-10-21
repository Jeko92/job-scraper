import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { Company } from '../../companies/entities/company.entity.js';
import { decimalTransformer } from '../../db/decimal.transformer.js';
import { Location } from '../../locations/entities/location.entity.js';
import { JobSkill } from './job-skill.entity.js';

@Entity('jobs')
@Index(['companyId', 'sourceUrl'], { unique: true })
@Index(['companyId', 'externalId'], { unique: true })
@Index(['locationId'])
@Index(['isActive', 'lastSeenAt'])
@Index(['publishedAt'])
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company?: Relation<Company>;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId!: string | null;

  @ManyToOne(() => Location, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'location_id' })
  location?: Relation<Location> | null;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    name: 'employment_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  employmentType!: string | null;

  @Column({
    name: 'workplace_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  workplaceType!: string | null;

  @Column({ name: 'source_url', type: 'varchar', length: 2048 })
  sourceUrl!: string;

  @Column({
    name: 'external_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  externalId!: string | null;

  @Column({
    name: 'salary_min',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  salaryMin!: number | null;

  @Column({
    name: 'salary_max',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  salaryMax!: number | null;

  @Column({ name: 'salary_currency', type: 'char', length: 3, nullable: true })
  salaryCurrency!: string | null;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({
    name: 'first_seen_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  firstSeenAt!: Date;

  @Column({ name: 'last_seen_at', type: 'timestamptz', default: () => 'now()' })
  lastSeenAt!: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => JobSkill, (jobSkill) => jobSkill.job)
  skills?: Relation<JobSkill>[];
}
