import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Hotel } from './hotel.entity';

@Entity('hotels')
export class HotelEntity implements Hotel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  webLink?: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ type: 'boolean', nullable: false })
  isOpen: boolean;

  @Column({
    type: 'decimal',
    precision: 9,
    scale: 6,
  })
  latitude: string;

  @Column({
    type: 'decimal',
    precision: 9,
    scale: 6,
  })
  longitude: string;
}
