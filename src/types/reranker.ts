export type RerankerProvider = "COHERE" | "JINA" | "BGE" | "LOCAL";

export interface RerankerConfig {
  id: string;
  name: string;
  provider: RerankerProvider;
  model: string;
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface RerankerSchema {
  provider: RerankerProvider;
  configSchema: any;
}
