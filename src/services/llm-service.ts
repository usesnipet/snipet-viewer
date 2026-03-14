import { LLMConfig } from "../types/llm";

const MOCK_LLMS: LLMConfig[] = [
  {
    id: "llm-1",
    name: "Production GPT-4",
    provider: "OPENAI",
    model: "gpt-4o",
    purpose: "COMPLETION",
    config: { temperature: 0.5 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "llm-2",
    name: "OpenAI Embeddings",
    provider: "OPENAI",
    model: "text-embedding-3-small",
    purpose: "EMBEDDING",
    config: { apiKey: "sk-..." },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class LLMService {
  private static llms = [...MOCK_LLMS];

  static async getSchemas() {
    return [
      {
        provider: "OPENAI",
        configSchema: {
          type: "object",
          title: "OpenAI Configuration",
          required: ["apiKey", "model"],
          properties: {
            apiKey: { type: "string", title: "API Key", description: "Your OpenAI API Key" },
            model: { type: "string", title: "Model", enum: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"], default: "gpt-4o" },
            temperature: { type: "number", title: "Temperature", minimum: 0, maximum: 2, default: 0.7 },
            maxTokens: { type: "integer", title: "Max Tokens", minimum: 1, maximum: 4096, default: 2048 },
          }
        }
      },
      {
        provider: "ANTHROPIC",
        configSchema: {
          type: "object",
          title: "Anthropic Configuration",
          required: ["apiKey", "model"],
          properties: {
            apiKey: { type: "string", title: "API Key", description: "Your Anthropic API Key" },
            model: { type: "string", title: "Model", enum: ["claude-3-5-sonnet-20240620", "claude-3-opus-20240229"], default: "claude-3-5-sonnet-20240620" },
            temperature: { type: "number", title: "Temperature", minimum: 0, maximum: 1, default: 0.7 },
          }
        }
      },
      {
        provider: "GOOGLE",
        configSchema: {
          type: "object",
          title: "Google Gemini Configuration",
          required: ["apiKey", "model"],
          properties: {
            apiKey: { type: "string", title: "API Key", description: "Your Google AI Studio API Key" },
            model: { type: "string", title: "Model", enum: ["gemini-1.5-pro", "gemini-1.5-flash"], default: "gemini-1.5-pro" },
          }
        }
      }
    ];
  }

  static async getLLMs() {
    return this.llms;
  }

  static async createLLM(data: Omit<LLMConfig, "id" | "createdAt" | "updatedAt">) {
    const newLLM: LLMConfig = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.llms.push(newLLM);
    return newLLM;
  }

  static async updateLLM(id: string, data: Partial<LLMConfig>) {
    this.llms = this.llms.map(l => l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l);
  }

  static async deleteLLM(id: string) {
    this.llms = this.llms.filter(l => l.id !== id);
  }
}
