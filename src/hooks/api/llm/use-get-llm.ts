import { useQuery } from "@tanstack/react-query";
import { apiClient, extractApiData } from "../api-client";

export const getLLMQueryKey = () => ["get", "api", "llms"] as const;

export const useGetLLMs = () => {
  return useQuery({
    queryKey: getLLMQueryKey(),
    queryFn: () => extractApiData(apiClient.api.llmsList()),
  });
}