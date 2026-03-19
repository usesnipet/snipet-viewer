import { useQuery } from "@tanstack/react-query";
import { apiClient, extractApiData } from "../api-client";
import { mapLlmApiToUi } from "../shared";

export const getLLMQueryKey = () => ["get", "api", "llms"] as const;
export const getApiLlmsQueryKey = () => ["api", "llms"] as const;
type LlmListQuery = Parameters<typeof apiClient.api.llmsList>[0];

export const useGetLLMs = (query?: LlmListQuery) => {
  return useQuery({
    queryKey: [...getLLMQueryKey(), query ?? {}] as const,
    queryFn: async () => {
      const dtos = await extractApiData(apiClient.api.llmsList(query));
      return (dtos as any[]).map(mapLlmApiToUi);
    },
  });
};