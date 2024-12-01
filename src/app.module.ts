import { Module } from '@nestjs/common';
import { ConfigModule } from './common/configs/config.module';
import { DatabaseModule } from './database/database.module';
import { HotelsModule } from './hotels/hotels.module';

@Module({
  imports: [ConfigModule, DatabaseModule, HotelsModule],
})
export class AppModule {}
