import { z } from "zod";

export const embeddingProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  status: z.enum(["ACTIVE", "DEPRECATED"]),
  llmId: z.string().min(1, "LLM is required"),
  splitterSettings: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, "Invalid JSON format"),
  preProcessorSettings: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, "Invalid JSON format"),
});

export type EmbeddingProfileFormValues = z.infer<typeof embeddingProfileSchema>;
