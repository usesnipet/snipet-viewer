import { useQuery } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";
import type { KnowledgeBase } from "@/types";

export const getApiKnowledgeBasesQueryKey = () => ["api", "knowledge-bases"] as const;

export function useGetKnowledgeBases() {
  return useQuery<KnowledgeBase[], unknown>({
    queryKey: getApiKnowledgeBasesQueryKey(),
    queryFn: async () => {
      const dtos = await extractApiData(apiClient.api.knowledgeBasesList());
      return dtos as unknown as KnowledgeBase[];
    },
  });
}
