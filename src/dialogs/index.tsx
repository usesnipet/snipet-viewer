import { CreateOrUpdateRerankerDialog } from './create-or-update-reranker';
import { CreateOrUpdateLLMDialog } from './create-or-update-llm';
import { CreateOrUpdateKnowledgeSourceDialog } from './create-or-update-knowledge-source';
import { CreateOrUpdateKnowledgeBaseDialog } from './create-or-update-knowledge-base';
import { ConfirmDialog } from './confirm';

export enum DialogType {
  CREATE_OR_UPDATE_RERANKER = 'create-or-update-reranker',
  CREATE_OR_UPDATE_LLM = 'create-or-update-llm',
  CREATE_OR_UPDATE_KNOWLEDGE_SOURCE = 'create-or-update-knowledge-source',
  CREATE_OR_UPDATE_KNOWLEDGE_BASE = 'create-or-update-knowledge-base',
  CONFIRM = 'confirm',
}

export const dialogs = {
  [DialogType.CREATE_OR_UPDATE_RERANKER]: CreateOrUpdateRerankerDialog,
  [DialogType.CREATE_OR_UPDATE_LLM]: CreateOrUpdateLLMDialog,
  [DialogType.CREATE_OR_UPDATE_KNOWLEDGE_SOURCE]: CreateOrUpdateKnowledgeSourceDialog,
  [DialogType.CREATE_OR_UPDATE_KNOWLEDGE_BASE]: CreateOrUpdateKnowledgeBaseDialog,
  [DialogType.CONFIRM]: ConfirmDialog,
} as const;
