import { useMutation } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";
import type { KnowledgeSource } from "@/types";

export function usePatchKnowledgeSourcesId() {
  return useMutation<KnowledgeSource, unknown, { id: string; data: any }>({
    mutationFn: async ({ id, data }) => extractApiData(apiClient.api.knowledgeSourcesPartialUpdate(id, data)),
  });
}
