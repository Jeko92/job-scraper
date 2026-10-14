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
import { CompanySource } from './company-source.entity.js';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ name: 'legal_name', type: 'varchar', nullable: true })
  legalName!: string | null;

  @Column({ type: 'varchar', unique: true })
  domain!: string;

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
  )
  locations?: Relation<CompanyLocation>[];

  @OneToMany(
    () => CompanyIndustry,
    (companyIndustry) => companyIndustry.company,
  )
  industries?: Relation<CompanyIndustry>[];

  @OneToMany(() => CompanySkill, (companySkill) => companySkill.company)
  skills?: Relation<CompanySkill>[];

  @OneToMany(() => CompanySource, (companySource) => companySource.company)
  sources?: Relation<CompanySource>[];
}
