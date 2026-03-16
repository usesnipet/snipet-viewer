export interface Reranker {
  id: string;
  name: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  createdAt: string;
  updatedAt: string;
}