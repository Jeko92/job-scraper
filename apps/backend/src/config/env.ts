import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3030),
  DATABASE_URL: z.url(),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().positive(),
  PASSWORD_MIN_LENGTH: z.coerce.number().int().positive(),
  JWT_SECRET: z.string().nonempty(),
  JWT_EXPIRES_IN: z.coerce.number().int().positive(),
  OPENAI_API_KEY: z.string().nonempty(),
  OPENAI_MODEL: z.string().nonempty().default('gpt-5-mini'),
});

export type Env = z.infer<typeof envSchema>;
