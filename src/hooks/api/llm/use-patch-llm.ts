import { useMutation } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";
import { mapLlmApiToUi, mapLlmUiToApi } from "../shared";
import type { LLM } from "@/types";

export function usePatchLlmsId() {
  return useMutation<LLM, unknown, { id: string; data: any }>({
    mutationFn: async ({ id, data }) => {
      const dto = mapLlmUiToApi(data);
      const updated = await extractApiData(apiClient.api.llmsPartialUpdate(id, dto));
      return mapLlmApiToUi(updated);
    },
  });
}
