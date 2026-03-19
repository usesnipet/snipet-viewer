import { useMutation } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";

export function useDeleteRerankersId() {
  return useMutation<unknown, unknown, { id: string }>({
    mutationFn: async ({ id }) => extractApiData(apiClient.api.rerankersDelete(id)),
  });
}
