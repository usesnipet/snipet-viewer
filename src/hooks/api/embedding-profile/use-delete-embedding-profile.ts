import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";

export function useDeleteEmbeddingProfilesId() {
  const queryClient = useQueryClient();
  return useMutation<unknown, unknown, { id: string }>({
    mutationFn: async ({ id }) => extractApiData(apiClient.api.embeddingProfilesDelete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getApiEmbeddingProfilesQueryKey() });
    },
  });
}
