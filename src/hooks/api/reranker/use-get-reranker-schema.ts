import { useQuery } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";
import type { PresetSchemaItem } from "../shared";

export const getApiRerankersSchemaQueryKey = (targetId?: string) =>
  ["api", "rerankers", "schema", { targetId: targetId ?? null }] as const;

export function useGetRerankersSchema(targetId?: string) {
  return useQuery<PresetSchemaItem[], unknown>({
    queryKey: getApiRerankersSchemaQueryKey(targetId),
    queryFn: async () => {
      const dtos = await extractApiData(apiClient.api.rerankersSchemaList(targetId ? { targetId } : undefined));
      return dtos as unknown as PresetSchemaItem[];
    },
  });
}
