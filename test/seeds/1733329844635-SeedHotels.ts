import { MigrationInterface, QueryRunner } from 'typeorm';
import { hotelSeedData } from './data/hotels';

export class SeedHotels1733329844635 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const hotel of hotelSeedData) {
      await queryRunner.query(
        `INSERT INTO hotels (name, webLink, address, city, country, email, isOpen, latitude, longitude) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          hotel.name,
          hotel.webLink,
          hotel.address,
          hotel.city,
          hotel.country,
          hotel.email,
          hotel.isOpen,
          hotel.latitude,
          hotel.longitude,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hotelNames = hotelSeedData
      .map((hotel) => `'${hotel.name}'`)
      .join(', ');
    await queryRunner.query(`DELETE FROM hotels WHERE name IN (${hotelNames})`);
  }
}
