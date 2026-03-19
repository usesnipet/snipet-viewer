import { useQuery } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";
import type { PresetSchemaItem } from "../shared";
import type { KnowledgeSource } from "@/types";

export const getApiKnowledgeSourcesQueryKey = () => ["api", "knowledge-sources"] as const;

export function useGetKnowledgeSources() {
  return useQuery<KnowledgeSource[], unknown>({
    queryKey: getApiKnowledgeSourcesQueryKey(),
    queryFn: async () => {
      const dtos = await extractApiData(apiClient.api.knowledgeSourcesList());
      return dtos as unknown as KnowledgeSource[];
    },
  });
}

export const getApiKnowledgeSourcesSchemaQueryKey = (targetId?: string) =>
  ["api", "knowledge-sources", "schema", { targetId: targetId ?? null }] as const;

export function useGetKnowledgeSourcesSchema(targetId?: string) {
  return useQuery<PresetSchemaItem[], unknown>({
    queryKey: getApiKnowledgeSourcesSchemaQueryKey(targetId),
    queryFn: async () => {
      const dtos = await extractApiData(apiClient.api.knowledgeSourcesSchemaList(targetId ? { targetId } : undefined));
      return dtos as unknown as PresetSchemaItem[];
    },
  });
}
