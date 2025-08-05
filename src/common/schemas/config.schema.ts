import { z } from 'zod';

const wildcardUrlPattern = /^https?:\/\/(\*\.)?[\w.-]+(?::\d+)?(\/.*)?$/;

export const configSchema = z.object({
  server: z.object({
    nodeEnv: z
      .string()
      .nonempty()
      .transform((x) => x.toLowerCase())
      .refine((x) => ['development', 'production', 'test'].includes(x), {
        message:
          'NODE_ENV must be one of "development", "production", or "test"',
      })
      .default('development'),
    port: z.number().int().positive().default(3000),
  }),
  auth: z.object({
    gatewayJwtSecret: z.string().nonempty(),
    gatewayJwtHeader: z.string().nonempty().default('x-gateway-jwt'),
  }),
  cors: z.object({
    origin: z
      .union([
        z.literal('*'),
        z.string().url(),
        z.string().regex(wildcardUrlPattern, 'Invalid wildcard URL format.'),
        z.array(
          z.union([
            z.string().url(),
            z
              .string()
              .regex(wildcardUrlPattern, 'Invalid wildcard URL format.'),
          ]),
        ),
      ])
      .default('http://localhost:3000'),
    methods: z.string().default('GET,HEAD,PUT,PATCH,POST,DELETE'),
    credentials: z.boolean().default(true),
  }),
  storage: z.object({
    path: z.string().nonempty().default('/storage'),
    maxFileSize: z.number().int().positive().default(10485760), // 10 MB
    allowedFileTypes: z.array(z.string()).default(['image/jpeg', 'image/png']),
  }),
});

export type Config = z.infer<typeof configSchema>;
