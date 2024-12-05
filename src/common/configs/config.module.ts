import { Global, Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: ['production', 'test'].includes(process.env.NODE_ENV), // use shell env vars in production
      envFilePath: '.env.development',
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
