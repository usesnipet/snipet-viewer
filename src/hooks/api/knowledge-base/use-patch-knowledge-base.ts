import { useMutation } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";
import type { KnowledgeBase } from "@/types";

export function usePatchKnowledgeBasesId() {
  return useMutation<KnowledgeBase, unknown, { id: string; data: any }>({
    mutationFn: async ({ id, data }) => extractApiData(apiClient.api.knowledgeBasesPartialUpdate(id, data)),
  });
}
