import { useQuery } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";
import type { Reranker } from "@/types";

export const getApiRerankersQueryKey = () => ["api", "rerankers"] as const;

export function useGetRerankers() {
  return useQuery<Reranker[], unknown>({
    queryKey: getApiRerankersQueryKey(),
    queryFn: async () => {
      const dtos = await extractApiData(apiClient.api.rerankersList());
      return dtos as unknown as Reranker[];
    },
  });
}
