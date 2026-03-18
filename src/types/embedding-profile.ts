import { LLM } from "./llm";

export type EmbeddingProfileStatus = 'ACTIVE' | 'DEPRECATED';

export interface EmbeddingProfile {
  id: string;
  name: string;
  status: EmbeddingProfileStatus;
  createdAt: string;
  splitterType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  splitterSettings: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preProcessorSettings: any;
  llmId: string;
  llm?: LLM;
}

