export type EmbeddingProfileStatus = "ACTIVE" | "DEPRECATED";

export interface EmbeddingProfile {
  id: string;
  name: string;
  status: EmbeddingProfileStatus;
  splitterSettings: string; // JSON string
  preProcessorSettings: string; // JSON string
  llmId: string;
  createdAt: string;
}
