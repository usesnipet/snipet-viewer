import { useQuery } from "@tanstack/react-query";

import { apiClient, extractApiData } from "../api-client";

export const getApiVersionQueryKey = () => ["api", "version"] as const;

export function useGetVersion() {
  return useQuery({
    queryKey: getApiVersionQueryKey(),
    queryFn: () => extractApiData(apiClient.api.versionList()),
  });
}
