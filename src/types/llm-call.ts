export interface LLMCall {
  id: string;
  cost?: number | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
  duration: number;
  createdAt: string;
  llmId: string;
}

