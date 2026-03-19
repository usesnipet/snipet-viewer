import { useMutation } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";
import type { Reranker } from "@/types";

export function usePatchRerankersId() {
  return useMutation<Reranker, unknown, { id: string; data: any }>({
    mutationFn: async ({ id, data }) => extractApiData(apiClient.api.rerankersPartialUpdate(id, data)),
  });
}
