export type EmbeddingProfileStatus = 'ACTIVE' | 'DEPRECATED';

export interface EmbeddingProfile {
  id: string;
  name: string;
  status: EmbeddingProfileStatus;
  createdAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  splitterSettings: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preProcessorSettings: any;
  llmId: string;
}

