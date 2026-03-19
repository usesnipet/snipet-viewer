import { useMutation } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";

export function useDeleteKnowledgeSourcesId() {
  return useMutation<unknown, unknown, { id: string }>({
    mutationFn: async ({ id }) => extractApiData(apiClient.api.knowledgeSourcesDelete(id)),
  });
}
