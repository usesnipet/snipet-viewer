export type KnowledgeSourceStatus = 'ACTIVE' | 'ARCHIVED';

export interface KnowledgeSource {
  id: string;
  name: string;
  description?: string | null;
  status: KnowledgeSourceStatus;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  type: string;
  createdAt: string;
  updatedAt: string;
  embeddingProfileId?: string | null;
}

export interface KnowledgeSourceVersion {
  id: string;
  latest: boolean;
  version: number;
  changeLog: string;
  releasedAt?: string | null;
  knowledgeSourceId: string;
}