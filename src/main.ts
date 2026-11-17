import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('main');

  const trustProxy = config.get<number>('trustProxy', 0);
  if (trustProxy > 0) app.set('trust proxy', trustProxy); // req.ip real atrás de nginx/traefik (throttler)

  app.use(helmet());
  app.useBodyParser('json', { limit: '10mb' });
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  const origins = config.get<string[]>('corsOrigins', ['*']);
  app.enableCors({
    origin: origins.includes('*') ? true : origins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove campos que não estão no DTO
      forbidNonWhitelisted: true, // e recusa a request se vier campo extra
      transform: true,
    }),
  );

  if (config.get<boolean>('enableDocs')) {
    const doc = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle(`API | ${config.get('env')}`).setVersion('1.0.0').addBearerAuth().build(),
    );
    SwaggerModule.setup('docs', app, doc);
    logger.log('Swagger em /docs');
  }

  const port = config.get<number>('port', 3000);
  await app.listen(port);
  logger.log(`API (${config.get('env')}) na porta ${port}`);
}
await bootstrap();
