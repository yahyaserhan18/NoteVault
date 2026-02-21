import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './commen/interceptors/response.interceptors';
import { AllExceptionsFilter } from './commen/filters/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  // Ensure uploads directory exists and serve it as static files
  const uploadsPath = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsPath)) {
    mkdirSync(uploadsPath, { recursive: true });
  }
  app.use('/uploads', require('express').static(uploadsPath));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );
  
  //set global prefix -> api
  app.setGlobalPrefix('api');

  //set global interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  //set global filter
  app.useGlobalFilters(new AllExceptionsFilter());

  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
