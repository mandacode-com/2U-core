import { z } from 'zod';

export const tokenPayloadSchema = z.object({
  uuid: z.string().uuid(),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
