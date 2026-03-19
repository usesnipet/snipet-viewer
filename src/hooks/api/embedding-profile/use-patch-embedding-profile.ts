import { useMutation } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";
import type { EmbeddingProfile } from "@/types";

export function usePatchEmbeddingProfilesId() {
  return useMutation<EmbeddingProfile, unknown, { id: string; data: any }>({
    mutationFn: async ({ id, data }) => extractApiData(apiClient.api.embeddingProfilesPartialUpdate(id, data)),
  });
}
