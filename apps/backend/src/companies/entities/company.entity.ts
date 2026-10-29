import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { CompanyIndustry } from './company-industry.entity.js';
import { CompanyLocation } from './company-location.entity.js';
import { CompanySkill } from './company-skill.entity.js';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true })
  name!: string | null;

  @Column({ name: 'legal_name', type: 'varchar', nullable: true })
  legalName!: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  domain!: string | null;

  @Column({ name: 'website_url', type: 'varchar', nullable: true })
  websiteUrl!: string | null;

  @Column({ name: 'company_type', type: 'varchar', nullable: true })
  companyType!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'number_of_employees', type: 'int', nullable: true })
  numberOfEmployees!: number | null;

  @Column({ name: 'employee_range', type: 'varchar', nullable: true })
  employeeRange!: string | null;

  @Column({ name: 'founding_year', type: 'int', nullable: true })
  foundingYear!: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(
    () => CompanyLocation,
    (companyLocation) => companyLocation.company,
    { cascade: ['insert', 'update'] },
  )
  locations?: Relation<CompanyLocation>[];

  @OneToMany(() => CompanySkill, (companySkill) => companySkill.company, {
    cascade: ['insert', 'update'],
  })
  skills?: Relation<CompanySkill>[];

  @OneToMany(
    () => CompanyIndustry,
    (companyIndustry) => companyIndustry.company,
    { cascade: ['insert', 'update'] },
  )
  industries?: Relation<CompanyIndustry>[];
}
