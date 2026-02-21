import * as Joi from 'joi';

/**
 * Validation schema for environment variables.
 * Validated at app bootstrap; app will not start if env is invalid.
 */
export const envValidationSchema = Joi.object({
  // Server
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .messages({
      'any.only': 'NODE_ENV must be one of: development, production, test',
    }),

  PORT: Joi.number()
    .port()
    .default(3000)
    .messages({
      'number.base': 'PORT must be a number',
      'number.port': 'PORT must be a valid port (1-65535)',
    }),

  // Database (required)
  DATABASE_URL: Joi.string()
    .required()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .messages({
      'string.empty': 'DATABASE_URL is required',
      'any.required': 'DATABASE_URL is required',
      'string.uri': 'DATABASE_URL must be a valid PostgreSQL connection URI (e.g. postgresql://user:pass@host:5432/db)',
    }),

  // JWT — Access Token (required)
  JWT_ACCESS_SECRET: Joi.string().min(32).required().messages({
    'string.empty': 'JWT_ACCESS_SECRET is required',
    'any.required': 'JWT_ACCESS_SECRET is required',
    'string.min': 'JWT_ACCESS_SECRET must be at least 32 characters',
  }),

  JWT_ACCESS_EXPIRY: Joi.string().default('15m').messages({
    'string.base': 'JWT_ACCESS_EXPIRY must be a string (e.g. 15m, 1h)',
  }),

  // JWT — Refresh Token (required)
  JWT_REFRESH_SECRET: Joi.string().min(32).required().messages({
    'string.empty': 'JWT_REFRESH_SECRET is required',
    'any.required': 'JWT_REFRESH_SECRET is required',
    'string.min': 'JWT_REFRESH_SECRET must be at least 32 characters',
  }),

  JWT_REFRESH_EXPIRY: Joi.string().default('7d').messages({
    'string.base': 'JWT_REFRESH_EXPIRY must be a string (e.g. 7d, 30d)',
  }),
})
  .options({
    stripUnknown: true,
    abortEarly: true,
  });

/** Validated env shape (matches envValidationSchema) */
export interface EnvSchema {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRY: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRY: string;
}
