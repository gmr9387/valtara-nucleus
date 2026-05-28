import { z } from "zod";
import { slugSchema } from "./organization.schemas";

export const createProjectSchema = z.object({
  organization_id: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  slug: slugSchema,
  description: z.string().trim().max(500).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
