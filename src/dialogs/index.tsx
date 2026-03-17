import { CreateOrUpdateRerankerDialog } from './create-or-update-reranker';
import { CreateOrUpdateLLMDialog } from './create-or-update-llm';
import { CreateOrUpdateKnowledgeSourceDialog } from './create-or-update-knowledge-source';
import { CreateOrUpdateKnowledgeBaseDialog } from './create-or-update-knowledge-base';
import { CreateOrUpdateEmbeddingProfileDialog } from './create-or-update-embedding-profile';
import { ConfirmDialog } from './confirm';
import { SchemaFormDialog } from './schema-form';

export enum DialogType {
  CREATE_OR_UPDATE_RERANKER = 'create-or-update-reranker',
  CREATE_OR_UPDATE_LLM = 'create-or-update-llm',
  CREATE_OR_UPDATE_EMBEDDING_PROFILE = 'create-or-update-embedding-profile',
  CREATE_OR_UPDATE_KNOWLEDGE_SOURCE = 'create-or-update-knowledge-source',
  CREATE_OR_UPDATE_KNOWLEDGE_BASE = 'create-or-update-knowledge-base',
  CONFIRM = 'confirm',
  SCHEMA_FORM = 'schema-form',
}

export const dialogs = {
  [DialogType.CREATE_OR_UPDATE_RERANKER]: CreateOrUpdateRerankerDialog,
  [DialogType.CREATE_OR_UPDATE_LLM]: CreateOrUpdateLLMDialog,
  [DialogType.CREATE_OR_UPDATE_EMBEDDING_PROFILE]: CreateOrUpdateEmbeddingProfileDialog,
  [DialogType.CREATE_OR_UPDATE_KNOWLEDGE_SOURCE]: CreateOrUpdateKnowledgeSourceDialog,
  [DialogType.CREATE_OR_UPDATE_KNOWLEDGE_BASE]: CreateOrUpdateKnowledgeBaseDialog,
  [DialogType.CONFIRM]: ConfirmDialog,
  [DialogType.SCHEMA_FORM]: SchemaFormDialog,
} as const;
