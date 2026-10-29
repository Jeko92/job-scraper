import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';

import { Industry } from '../../industries/entities/industry.entity.js';
import { Company } from './company.entity.js';

@Entity('company_industries')
export class CompanyIndustry {
  @PrimaryColumn({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @PrimaryColumn({ name: 'industry_id', type: 'uuid' })
  industryId!: string;

  @ManyToOne(() => Company, (company) => company.industries, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'disable',
  })
  @JoinColumn({ name: 'company_id' })
  company?: Relation<Company>;

  @ManyToOne(() => Industry, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'industry_id' })
  industry?: Relation<Industry>;
}
