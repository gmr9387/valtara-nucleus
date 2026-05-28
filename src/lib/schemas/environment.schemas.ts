import { z } from "zod";

export const envTypeSchema = z.enum(["development", "staging", "production"]);

export const createEnvironmentSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().trim().min(1).max(60),
  env_type: envTypeSchema,
});

export type EnvType = z.infer<typeof envTypeSchema>;
export type CreateEnvironmentInput = z.infer<typeof createEnvironmentSchema>;
