import Joi from 'joi';

export const bootstrapSchema = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test', 'staging'),
  CONFIG_ENDPOINT: Joi.string().uri().required(),
  CONFIG_API_KEY: Joi.string().required(),
});

export const runtimeConfigSchema = Joi.object({
  JWT_TOKEN: Joi.string().required(),
  PIXELLAB_API_KEY: Joi.string().required(),
  DEEPL_API_KEY: Joi.string().required(),

  DATABASE_URL: Joi.string().required(),

  MINIO_USE_SSL: Joi.string().valid('true', 'false').default('false'),
  MINIO_ENDPOINT: Joi.string().required(),
  MINIO_ACCESS_KEY: Joi.string().required(),
  MINIO_SECRET_KEY: Joi.string().required(),
  MINIO_BUCKET: Joi.string().default('odg-images'),
  MINIO_PUBLIC_ENDPOINT: Joi.string().uri().optional(),
});
