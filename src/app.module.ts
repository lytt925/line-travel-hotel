import { Module } from '@nestjs/common';
import { ConfigModule } from './common/configs/config.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [ConfigModule, DatabaseModule],
})
export class AppModule {}
