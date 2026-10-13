import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'country_code', type: 'varchar', nullable: true })
  countryCode!: string | null;

  @Column({ name: 'country_name', type: 'varchar', nullable: true })
  countryName!: string | null;

  @Column({ name: 'state_name', type: 'varchar', nullable: true })
  stateName!: string | null;

  @Column({ type: 'varchar', nullable: true })
  city!: string | null;

  @Column({ name: 'postal_code', type: 'varchar', nullable: true })
  postalCode!: string | null;
}
