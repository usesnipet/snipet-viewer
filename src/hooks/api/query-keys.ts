export function getApiLlmsQueryKey() {
  return ["api", "llms"] as const;
}

export function getApiRerankersQueryKey() {
  return ["api", "rerankers"] as const;
}

export function getApiEmbeddingProfilesSuspenseQueryKey() {
  // This key is used by invalidateQueries after mutations on the embedding profiles page.
  // Keep it stable to ensure cache invalidation works even if query options evolve.
  return ["api", "embedding-profiles"] as const;
}

export function getApiKnowledgeBasesQueryKey() {
  return ["api", "knowledge-bases"] as const;
}

export function getApiKnowledgeSourcesQueryKey() {
  return ["api", "knowledge-sources"] as const;
}

