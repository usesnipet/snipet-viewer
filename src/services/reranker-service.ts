import { RerankerConfig, RerankerSchema } from "../types/reranker";

const MOCK_RERANKERS: RerankerConfig[] = [
  {
    id: "rerank-1",
    name: "Cohere Rerank English",
    provider: "COHERE",
    model: "rerank-english-v3.0",
    config: { apiKey: "..." },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "rerank-2",
    name: "Jina Reranker v2",
    provider: "JINA",
    model: "jina-reranker-v2-base-multilingual",
    config: { apiKey: "..." },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class RerankerService {
  private static rerankers = [...MOCK_RERANKERS];

  static async getSchemas(): Promise<RerankerSchema[]> {
    return [
      {
        provider: "COHERE",
        configSchema: {
          type: "object",
          title: "Cohere Configuration",
          required: ["apiKey", "model"],
          properties: {
            apiKey: { type: "string", title: "API Key", description: "Your Cohere API Key" },
            model: { 
              type: "string", 
              title: "Model", 
              enum: ["rerank-english-v3.0", "rerank-multilingual-v3.0", "rerank-english-v2.0", "rerank-multilingual-v2.0"], 
              default: "rerank-english-v3.0" 
            },
          }
        }
      },
      {
        provider: "JINA",
        configSchema: {
          type: "object",
          title: "Jina Configuration",
          required: ["apiKey", "model"],
          properties: {
            apiKey: { type: "string", title: "API Key", description: "Your Jina API Key" },
            model: { 
              type: "string", 
              title: "Model", 
              enum: ["jina-reranker-v2-base-multilingual", "jina-reranker-v1-base-en", "jina-reranker-v1-tiny-en"], 
              default: "jina-reranker-v2-base-multilingual" 
            },
          }
        }
      },
      {
        provider: "BGE",
        configSchema: {
          type: "object",
          title: "BGE Configuration",
          required: ["model"],
          properties: {
            model: { 
              type: "string", 
              title: "Model", 
              enum: ["BAAI/bge-reranker-v2-m3", "BAAI/bge-reranker-large", "BAAI/bge-reranker-base"], 
              default: "BAAI/bge-reranker-v2-m3" 
            },
            endpoint: { type: "string", title: "Endpoint URL", description: "Inference endpoint for BGE" }
          }
        }
      }
    ];
  }

  static async getRerankers() {
    return this.rerankers;
  }

  static async createReranker(data: Omit<RerankerConfig, "id" | "createdAt" | "updatedAt">) {
    const newReranker: RerankerConfig = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.rerankers.push(newReranker);
    return newReranker;
  }

  static async updateReranker(id: string, data: Partial<RerankerConfig>) {
    this.rerankers = this.rerankers.map(r => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r);
  }

  static async deleteReranker(id: string) {
    this.rerankers = this.rerankers.filter(r => r.id !== id);
  }
}
