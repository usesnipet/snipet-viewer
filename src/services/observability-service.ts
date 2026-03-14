import { LLMCall, LLMMetrics } from "../types/observability";

const MOCK_CALLS: LLMCall[] = Array.from({ length: 100 }).map((_, i) => {
  const promptTokens = Math.floor(Math.random() * 500) + 100;
  const completionTokens = Math.floor(Math.random() * 300) + 50;
  const totalTokens = promptTokens + completionTokens;
  const cost = totalTokens * 0.00002; // Mock rate
  const duration = Math.floor(Math.random() * 2000) + 500;
  
  // Random date in the last 7 days
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 7));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

  return {
    id: `call-${i}`,
    cost,
    promptTokens,
    completionTokens,
    totalTokens,
    duration,
    llmId: Math.random() > 0.5 ? "llm-1" : "llm-2",
    createdAt: date.toISOString(),
  };
});

export const ObservabilityService = {
  async getCalls(): Promise<LLMCall[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_CALLS), 500);
    });
  },

  async getMetrics(): Promise<LLMMetrics> {
    const calls = MOCK_CALLS;
    const totalCalls = calls.length;
    const totalCost = calls.reduce((acc, call) => acc + (call.cost || 0), 0);
    const totalTokens = calls.reduce((acc, call) => acc + (call.totalTokens || 0), 0);
    const avgDuration = calls.reduce((acc, call) => acc + call.duration, 0) / totalCalls;

    return {
      totalCalls,
      totalCost,
      totalTokens,
      avgDuration,
    };
  }
};
