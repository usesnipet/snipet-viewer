import { z } from "zod";

export const knowledgeBaseSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  sourceIds: z.array(z.string()),
});

export type KnowledgeBaseFormValues = z.infer<typeof knowledgeBaseSchema>;
