import { useMutation } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";
import { mapLlmApiToUi, mapLlmUiToApi } from "../shared";
import type { LLM } from "@/types";

export function usePostLlms() {
  return useMutation<LLM, unknown, { data: any }>({
    mutationFn: async ({ data }) => {
      const dto = mapLlmUiToApi(data);
      const created = await extractApiData(apiClient.api.llmsCreate(dto));
      return mapLlmApiToUi(created);
    },
  });
}
