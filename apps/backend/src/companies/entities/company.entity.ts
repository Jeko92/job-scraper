import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  name!: string | null;

  @Column({ nullable: true })
  legalName!: string | null;

  @Column({ unique: true, nullable: true })
  domain!: string | null;

  @Column({ nullable: true })
  websiteUrl!: string | null;

  @Column({ nullable: true })
  companyType!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'int', nullable: true })
  numberOfEmployees!: number | null;

  @Column({ nullable: true })
  employeeRange!: string | null;

  @Column({ type: 'int', nullable: true })
  foundingYear!: number | null;

  @Column({ type: 'timestamptz', nullable: false })
  createdAt!: Date;

  @Column({ type: 'timestamptz', nullable: false })
  updatedAt!: Date;
}
