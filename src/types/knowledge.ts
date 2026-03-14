export type KnowledgeSourceStatus = "ACTIVE" | "ARCHIVED";
export type KnowledgeSourceType = "S3" | "GCS" | "AZURE_BLOB_STORAGE" | "MINIO" | "WEB_SCRAPING" | "API" | "DATABASE";
export type KnowledgeMethod = "RAG" | "SEARCH";

export interface KnowledgeSource {
  id: string;
  name: string;
  description?: string;
  status: KnowledgeSourceStatus;
  type: KnowledgeSourceType;
  methods: KnowledgeMethod[];
  config: string;
  ragConfig?: string;
  searchConfig?: string;
  embeddingProfileId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  sourceIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeSourceVersion {
  id: string;
  version: number;
  latest: boolean;
  releasedAt: string;
  knowledgeSourceId: string;
}
