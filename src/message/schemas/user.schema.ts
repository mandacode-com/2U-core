import { z } from 'zod';

import { TipTapDocumentSchema } from './content.schema';

export const readMessageBodySchema = z.object({
  password: z.string().optional(),
});
export type ReadMessageBody = z.infer<typeof readMessageBodySchema>;

export const updatePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(1, 'New password is required'),
  newHint: z.string().optional(),
});
export type UpdatePasswordBody = z.infer<typeof updatePasswordBodySchema>;

export const updateMessageBodySchema = z.object({
  content: TipTapDocumentSchema.optional(),
  password: z.string().optional(),
  hint: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type UpdateMessageBody = z.infer<typeof updateMessageBodySchema>;

export const uploadImageBodySchema = z.object({
  password: z.string().optional(),
});
export type UploadImageBody = z.infer<typeof uploadImageBodySchema>;
