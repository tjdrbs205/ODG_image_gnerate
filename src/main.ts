import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

import dotenv from 'dotenv';
import { createClient } from '@tjdrbs205/config-client';
import { RuntimeConfigStore } from './core/config/runtime-config.store';
import { runtimeConfigSchema } from './core/config/env.validation';

if (process.env.NODE_ENV !== 'production') dotenv.config();

async function bootstrap() {
  const configClient = await createClient({
    endpoint: process.env.CONFIG_ENDPOINT!,
    application: ['pixellab_middleware'],
    profiles: ['default'],
    auth: {
      apiKey: process.env.CONFIG_API_KEY!,
    },
  }).load();
  const configData = configClient.toObject();
  const { error, value } = runtimeConfigSchema.validate(configData, {
    abortEarly: false,
  });
  if (error)
    throw new Error(`Runtime config validation error: ${error.message}`);
  Object.assign(RuntimeConfigStore, value);

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      validationError: { target: false, value: false },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
