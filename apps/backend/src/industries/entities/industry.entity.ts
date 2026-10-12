import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('industries')
export class Industry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ unique: true })
  slug!: string;
}
