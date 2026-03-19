import { useMutation } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";

export function useDeleteLlmsId() {
  return useMutation<unknown, unknown, { id: string }>({
    mutationFn: async ({ id }) => extractApiData(apiClient.api.llmsDelete(id)),
  });
}
