import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";
import type { PresetSchemaItem } from "../shared";
import type { EmbeddingProfile } from "@/types";

export const getEmbeddingProfilesQueryKey = () => ["api", "embedding-profiles"] as const;

export function useGetEmbeddingProfiles(query?: { includeLLM?: boolean }) {
  return useQuery<EmbeddingProfile[], unknown>({
    queryKey: getEmbeddingProfilesQueryKey(),
    queryFn: async () => {
      return await extractApiData(apiClient.api.embeddingProfilesList({
        includeLLM: query?.includeLLM
      }));
    },
  });
}

export const getSplitterSchemasQueryKey = (targetId?: string) =>
  ["api", "embedding-profiles", "splitter-schema", { targetId: targetId ?? null }] as const;

export function useGetSplitterSchemas(targetId?: string) {
  return useQuery<PresetSchemaItem[], unknown>({
    queryKey: getSplitterSchemasQueryKey(targetId),
    queryFn: async () => {
      const dtos = await extractApiData(
        apiClient.api.embeddingProfilesSplitterSchemaList(targetId ? { targetId } : undefined),
      );
      return dtos as unknown as PresetSchemaItem[];
    },
  });
}

type UseGetEmbeddingProfilesIdOptions = {
  query?: Omit<
    UseQueryOptions<EmbeddingProfile | null, unknown, EmbeddingProfile | null, readonly unknown[]>,
    "queryKey" | "queryFn"
  >;
};

export function useGetEmbeddingProfilesId(
  id: string,
  queryParams: { includeLLM?: boolean } = {},
  options?: UseGetEmbeddingProfilesIdOptions,
) {
  return useQuery<EmbeddingProfile | null, unknown>({
    queryKey: ["api", "embedding-profiles", "by-id", id, { includeLLM: queryParams.includeLLM ?? null }] as const,
    enabled: !!id,
    ...(options?.query ?? {}),
    queryFn: async () => {
      const dto = await extractApiData(
        apiClient.api.embeddingProfilesDetail(
          id,
          queryParams.includeLLM != null ? { includeLLM: queryParams.includeLLM } : undefined,
        ),
      );
      return dto as unknown as EmbeddingProfile;
    },
  });
}
