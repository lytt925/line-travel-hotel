import { MigrationInterface, QueryRunner } from 'typeorm';
import { userSeedData } from './data/users';
import * as argon2 from 'argon2';

export class SeedUsers1733585932237 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const user of userSeedData) {
      const hashedPassword = await argon2.hash(user.password);
      await queryRunner.query(
        `INSERT INTO users (email, password, firstName, lastName) 
                 VALUES (?, ?, ?, ?)`,
        [user.email, hashedPassword, user.firstName, user.lastName],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const userEmails = userSeedData.map((user) => `'${user.email}'`).join(', ');
    await queryRunner.query(`DELETE FROM users WHERE email IN (${userEmails})`);
  }
}
