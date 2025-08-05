import { z } from 'zod';

export const createProjectBodySchema = z.object({
  name: z.string().min(1, 'Project name is required'),
});

export type CreateProjectBody = z.infer<typeof createProjectBodySchema>;

export const updateProjectBodySchema = z.object({
  name: z.string().min(1, 'Project name is required'),
});

export type UpdateProjectBody = z.infer<typeof updateProjectBodySchema>;
