import { useMutation, useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";

import { api } from "./api-client";
import {
  getApiEmbeddingProfilesSuspenseQueryKey,
  getApiKnowledgeBasesQueryKey,
  getApiKnowledgeSourcesQueryKey,
  getApiLlmsQueryKey,
  getApiRerankersQueryKey,
} from "./query-keys";

import type { EmbeddingProfile, KnowledgeBase, KnowledgeSource, LLM, Reranker } from "@/types";
import type { LLMType } from "@/types/llm";

type PresetSchemaItem = {
  scope: string;
  targetId: string;
  // RJSF expects a JSON schema; we keep it flexible because the backend sends provider-specific shapes.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any;
  encryptedFields: string[];
};

function mapLlmApiToUi(dto: any): LLM {
  return {
    id: dto.id,
    name: dto.name ?? null,
    provider: dto.provider,
    type: dto.modelType as LLMType,
    config: dto.config,
    maxLimits: dto.maxLimits,
    currentLimits: dto.currentLimits,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function mapLlmUiToApi(input: any) {
  const { type, ...rest } = input ?? {};
  return {
    ...rest,
    modelType: type,
  };
}

async function unwrapApiData<T>(promise: Promise<{ data: T }>): Promise<T> {
  // swagger-typescript-api returns a response-like object with a `data` field.
  const res = (await promise) as any;
  return res.data as T;
}

export function useGetApiVersion(): UseQueryResult<{ version: string }, unknown> {
  return useQuery({
    queryKey: ["api", "version"] as const,
    queryFn: () => unwrapApiData(api.api.versionList()),
  });
}

// -----------------------------
// LLMs
// -----------------------------
export function useGetApiLlms() {
  return useQuery<LLM[], unknown>({
    queryKey: getApiLlmsQueryKey(),
    queryFn: async () => {
      const dtos = await unwrapApiData(api.api.llmsList());
      return (dtos as any[]).map(mapLlmApiToUi);
    },
  });
}

export function useGetApiLlmsSuspense(query?: { type?: string }) {
  return useQuery<LLM[], unknown>({
    queryKey: [...getApiLlmsQueryKey(), "suspense", query ?? {}] as const,
    suspense: true,
    throwOnError: false,
    queryFn: async () => {
      const dtos = await unwrapApiData(api.api.llmsList(query));
      return (dtos as any[]).map(mapLlmApiToUi);
    },
  });
}

export function useGetApiLlmsSchema(targetId?: string) {
  return useQuery<PresetSchemaItem[], unknown>({
    queryKey: ["api", "llms", "schema", { targetId: targetId ?? null }] as const,
    queryFn: async () => {
      const dtos = await unwrapApiData(api.api.llmsSchemaList(targetId ? { targetId } : undefined));
      return dtos as unknown as PresetSchemaItem[];
    },
  });
}

export function usePostApiLlms() {
  return useMutation<LLM, unknown, { data: any }>({
    mutationFn: async ({ data }) => {
      const dto = mapLlmUiToApi(data);
      const created = await unwrapApiData(api.api.llmsCreate(dto));
      return mapLlmApiToUi(created);
    },
  });
}

export function usePatchApiLlmsId() {
  return useMutation<LLM, unknown, { id: string; data: any }>({
    mutationFn: async ({ id, data }) => {
      const dto = mapLlmUiToApi(data);
      const updated = await unwrapApiData(api.api.llmsPartialUpdate(id, dto));
      return mapLlmApiToUi(updated);
    },
  });
}

export function useDeleteApiLlmsId() {
  return useMutation<unknown, unknown, { id: string }>({
    mutationFn: async ({ id }) => unwrapApiData(api.api.llmsDelete(id)),
  });
}

// -----------------------------
// Rerankers
// -----------------------------
export function useGetApiRerankersSuspense(): UseQueryResult<Reranker[], unknown> {
  return useQuery<Reranker[], unknown>({
    queryKey: getApiRerankersQueryKey(),
    suspense: true,
    throwOnError: false,
    queryFn: async () => {
      const dtos = await unwrapApiData(api.api.rerankersList());
      return dtos as unknown as Reranker[];
    },
  });
}

export function useGetApiRerankersSchema(targetId?: string) {
  return useQuery<PresetSchemaItem[], unknown>({
    queryKey: ["api", "rerankers", "schema", { targetId: targetId ?? null }] as const,
    queryFn: async () => {
      const dtos = await unwrapApiData(api.api.rerankersSchemaList(targetId ? { targetId } : undefined));
      return dtos as unknown as PresetSchemaItem[];
    },
  });
}

export function usePostApiRerankers() {
  return useMutation<Reranker, unknown, { data: any }>({
    mutationFn: async ({ data }) => unwrapApiData(api.api.rerankersCreate(data)),
  });
}

export function usePatchApiRerankersId() {
  return useMutation<Reranker, unknown, { id: string; data: any }>({
    mutationFn: async ({ id, data }) => unwrapApiData(api.api.rerankersPartialUpdate(id, data)),
  });
}

export function useDeleteApiRerankersId() {
  return useMutation<unknown, unknown, { id: string }>({
    mutationFn: async ({ id }) => unwrapApiData(api.api.rerankersDelete(id)),
  });
}

// -----------------------------
// Knowledge Bases
// -----------------------------
export function useGetApiKnowledgeBasesSuspense(): UseQueryResult<KnowledgeBase[], unknown> {
  return useQuery<KnowledgeBase[], unknown>({
    queryKey: getApiKnowledgeBasesQueryKey(),
    suspense: true,
    throwOnError: false,
    queryFn: async () =>
      unwrapApiData(api.api.knowledgeBasesList()).then((dtos) => dtos as unknown as KnowledgeBase[]),
  });
}

export function usePostApiKnowledgeBases() {
  return useMutation<KnowledgeBase, unknown, { data: any }>({
    mutationFn: async ({ data }) => unwrapApiData(api.api.knowledgeBasesCreate(data)),
  });
}

export function usePatchApiKnowledgeBasesId() {
  return useMutation<KnowledgeBase, unknown, { id: string; data: any }>({
    mutationFn: async ({ id, data }) => unwrapApiData(api.api.knowledgeBasesPartialUpdate(id, data)),
  });
}

export function useDeleteApiKnowledgeBasesId() {
  return useMutation<unknown, unknown, { id: string }>({
    mutationFn: async ({ id }) => unwrapApiData(api.api.knowledgeBasesDelete(id)),
  });
}

// -----------------------------
// Knowledge Sources
// -----------------------------
export function useGetApiKnowledgeSourcesSuspense(): UseQueryResult<KnowledgeSource[], unknown> {
  return useQuery<KnowledgeSource[], unknown>({
    queryKey: getApiKnowledgeSourcesQueryKey(),
    suspense: true,
    throwOnError: false,
    queryFn: async () =>
      unwrapApiData(api.api.knowledgeSourcesList()).then((dtos) => dtos as unknown as KnowledgeSource[]),
  });
}

export function useGetApiKnowledgeSourcesSchema(targetId?: string) {
  return useQuery<PresetSchemaItem[], unknown>({
    queryKey: ["api", "knowledge-sources", "schema", { targetId: targetId ?? null }] as const,
    queryFn: async () => {
      const dtos = await unwrapApiData(api.api.knowledgeSourcesSchemaList(targetId ? { targetId } : undefined));
      return dtos as unknown as PresetSchemaItem[];
    },
  });
}

export function usePostApiKnowledgeSources() {
  return useMutation<KnowledgeSource, unknown, { data: any }>({
    mutationFn: async ({ data }) => unwrapApiData(api.api.knowledgeSourcesCreate(data)),
  });
}

export function usePatchApiKnowledgeSourcesId() {
  return useMutation<KnowledgeSource, unknown, { id: string; data: any }>({
    mutationFn: async ({ id, data }) => unwrapApiData(api.api.knowledgeSourcesPartialUpdate(id, data)),
  });
}

export function useDeleteApiKnowledgeSourcesId() {
  return useMutation<unknown, unknown, { id: string }>({
    mutationFn: async ({ id }) => unwrapApiData(api.api.knowledgeSourcesDelete(id)),
  });
}

// -----------------------------
// Embedding Profiles
// -----------------------------
export function useGetApiEmbeddingProfilesSuspense(query?: { includeLLM?: boolean }): UseQueryResult<EmbeddingProfile[], unknown> {
  return useQuery<EmbeddingProfile[], unknown>({
    queryKey: getApiEmbeddingProfilesSuspenseQueryKey(),
    suspense: true,
    throwOnError: false,
    queryFn: async () => {
      const includeLLM = query?.includeLLM ?? true;
      const dtos = await unwrapApiData(api.api.embeddingProfilesList({ includeLLM }));
      return dtos as unknown as EmbeddingProfile[];
    },
  });
}

export function useGetApiEmbeddingProfilesSplitterSchema(targetId?: string) {
  return useQuery<PresetSchemaItem[], unknown>({
    queryKey: ["api", "embedding-profiles", "splitter-schema", { targetId: targetId ?? null }] as const,
    queryFn: async () => {
      const dtos = await unwrapApiData(
        api.api.embeddingProfilesSplitterSchemaList(targetId ? { targetId } : undefined),
      );
      return dtos as unknown as PresetSchemaItem[];
    },
  });
}

type UseGetApiEmbeddingProfilesIdOptions = {
  query?: Omit<UseQueryOptions<EmbeddingProfile | null, unknown, EmbeddingProfile | null, any[]>, "queryKey" | "queryFn">;
};

export function useGetApiEmbeddingProfilesId(
  id: string,
  queryParams: { includeLLM?: boolean } = {},
  options?: UseGetApiEmbeddingProfilesIdOptions,
): UseQueryResult<EmbeddingProfile | null, unknown> {
  return useQuery<EmbeddingProfile | null, unknown>({
    queryKey: ["api", "embedding-profiles", "by-id", id, { includeLLM: queryParams.includeLLM ?? null }] as const,
    enabled: !!id,
    ...(options?.query ?? {}),
    queryFn: async () => {
      const dto = await unwrapApiData(
        api.api.embeddingProfilesDetail(
          id,
          queryParams.includeLLM != null ? { includeLLM: queryParams.includeLLM } : undefined,
        ),
      );
      return dto as unknown as EmbeddingProfile;
    },
  });
}

export function usePostApiEmbeddingProfiles() {
  return useMutation<EmbeddingProfile, unknown, { data: any }>({
    mutationFn: async ({ data }) => unwrapApiData(api.api.embeddingProfilesCreate(data)),
  });
}

export function usePatchApiEmbeddingProfilesId() {
  return useMutation<EmbeddingProfile, unknown, { id: string; data: any }>({
    mutationFn: async ({ id, data }) => unwrapApiData(api.api.embeddingProfilesPartialUpdate(id, data)),
  });
}

export function useDeleteApiEmbeddingProfilesId() {
  return useMutation<unknown, unknown, { id: string }>({
    mutationFn: async ({ id }) => unwrapApiData(api.api.embeddingProfilesDelete(id)),
  });
}

