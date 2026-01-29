import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const app = await NestFactory.create(AppModule, {
    logger: isProduction ? ['error', 'warn', 'log'] : ['error', 'warn', 'log', 'debug'],
  });
  const logger = new Logger('Bootstrap');

  app.use(helmet({
    contentSecurityPolicy: false, // nginx handles CSP in production
    crossOriginEmbedderPolicy: false,
    xXssProtection: false,
  }));

  app.use(cookieParser());
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  const allowedOrigins = isProduction
    ? [process.env.FRONTEND_URL || 'http://localhost']
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost'];
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (!isProduction || process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Easy Gen App API')
      .setDescription('User authentication API with signup and signin endpoints')
      .setVersion('1.0')
      .addCookieAuth('access_token')
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  logger.log(`Application running on: http://localhost:${port}`);
  if (!isProduction || process.env.ENABLE_SWAGGER === 'true') {
    logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
  }
}

bootstrap();
