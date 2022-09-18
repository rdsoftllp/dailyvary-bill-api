import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import * as compression from 'compression';
import * as path from 'path';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { EnvConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.use(compression());
  app.use(helmet());
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      validationError: {
        value: true,
      },
    }),
  );

  app.setGlobalPrefix('api');
  app.setBaseViewsDir(path.join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');
  app.enableShutdownHooks();

  app.useGlobalInterceptors(new ErrorInterceptor());

  await app.listen(configService.get<number>(EnvConfig.PORT) || 3000);
}
bootstrap();
