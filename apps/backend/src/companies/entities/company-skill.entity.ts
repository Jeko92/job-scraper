import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';

import { Skill } from '../../skills/entities/skill.entity.js';
import { Company } from './company.entity.js';

@Entity('company_skills')
export class CompanySkill {
  @PrimaryColumn({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @PrimaryColumn({ name: 'skill_id', type: 'uuid' })
  skillId!: string;

  @ManyToOne(() => Company, (company) => company.skills, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'disable',
  })
  @JoinColumn({ name: 'company_id' })
  company?: Relation<Company>;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_id' })
  skill?: Relation<Skill>;
}
