import { useMutation } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";
import type { Reranker } from "@/types";

export function usePostRerankers() {
  return useMutation<Reranker, unknown, { data: any }>({
    mutationFn: async ({ data }) => extractApiData(apiClient.api.rerankersCreate(data)),
  });
}
