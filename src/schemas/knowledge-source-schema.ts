import { z } from "zod";

export const knowledgeSourceSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]),
  type: z.enum([
    "S3",
    "GCS",
    "AZURE_BLOB_STORAGE",
    "MINIO",
    "WEB_SCRAPING",
    "API",
    "DATABASE",
  ]),
  methods: z.array(z.enum(["RAG", "SEARCH"])).min(1, "Select at least one method"),
  config: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, "Invalid JSON format"),
  ragConfig: z.string().optional().refine((val) => {
    if (!val) return true;
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, "Invalid JSON format"),
  searchConfig: z.string().optional().refine((val) => {
    if (!val) return true;
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, "Invalid JSON format"),
  embeddingProfileId: z.string().optional(),
});

export type KnowledgeSourceFormValues = z.infer<typeof knowledgeSourceSchema>;
