import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.DEBUG === 'true'
        ? ['log', 'error', 'warn', 'debug', 'verbose']
        : ['log', 'error', 'warn'],
  });
  app.enableCors({
    credentials: true,
  });
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const config = new DocumentBuilder()
    .setTitle('Line Travel Hotels API')
    .setDescription('The Line Travel Hotels API description')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory, {
    jsonDocumentUrl: '/docs-json',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
