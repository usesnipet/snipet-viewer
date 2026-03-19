import { useMutation } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";
import type { KnowledgeBase } from "@/types";

export function usePostKnowledgeBases() {
  return useMutation<KnowledgeBase, unknown, { data: any }>({
    mutationFn: async ({ data }) => extractApiData(apiClient.api.knowledgeBasesCreate(data)),
  });
}
