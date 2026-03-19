import { useMutation } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";
import type { EmbeddingProfile } from "@/types";

export function usePostEmbeddingProfiles() {
  return useMutation<EmbeddingProfile, unknown, { data: any }>({
    mutationFn: async ({ data }) => extractApiData(apiClient.api.embeddingProfilesCreate(data)),
  });
}
