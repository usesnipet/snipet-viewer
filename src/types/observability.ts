export interface LLMCall {
  id: string;
  cost: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  duration: number; // in ms
  llmId: string;
  createdAt: string;
}

export interface LLMMetrics {
  totalCalls: number;
  totalCost: number;
  totalTokens: number;
  avgDuration: number;
}
