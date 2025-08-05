import { z } from 'zod';
import { TipTapDocumentSchema } from './content.schema';

export const createMessageBodySchema = z.object({
  content: TipTapDocumentSchema,
  messageId: z.string().optional(),
  initialPassword: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type CreateMessageBody = z.infer<typeof createMessageBodySchema>;

export const updateMessageBodySchema = z.object({
  content: TipTapDocumentSchema.optional(),
  password: z.string().optional(),
  hint: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type UpdateMessageBody = z.infer<typeof updateMessageBodySchema>;
