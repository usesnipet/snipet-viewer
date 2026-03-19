import { useMutation } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";
import type { KnowledgeSource } from "@/types";

export function usePostKnowledgeSources() {
  return useMutation<KnowledgeSource, unknown, { data: any }>({
    mutationFn: async ({ data }) => extractApiData(apiClient.api.knowledgeSourcesCreate(data)),
  });
}
