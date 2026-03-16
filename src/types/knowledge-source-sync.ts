export interface KnowledgeSourceSync {
  id: string;
  mode: string;
  cronExpression?: string | null;
  webhookEnabled: boolean;
  isActive: boolean;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
  createdAt: string;
  updatedAt: string;
  knowledgeSourceId: string;
}

