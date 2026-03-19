import { Api } from "@/api";

export const apiClient = new Api();

export async function extractApiData<T>(
  promise: Promise<{ data: T }>
): Promise<T> {
  const res = (await promise);
  return res.data as T;
}
