import { useQuery } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";
import type { PresetSchemaItem } from "../shared";

export const getApiLlmsSchemaQueryKey = (targetId?: string) =>
  ["api", "llms", "schema", { targetId: targetId ?? null }] as const;

export function useGetLlmsSchema(targetId?: string) {
  return useQuery<PresetSchemaItem[], unknown>({
    queryKey: getApiLlmsSchemaQueryKey(targetId),
    queryFn: async () => {
      const dtos = await extractApiData(apiClient.api.llmsSchemaList(targetId ? { targetId } : undefined));
      return dtos as unknown as PresetSchemaItem[];
    },
  });
}
