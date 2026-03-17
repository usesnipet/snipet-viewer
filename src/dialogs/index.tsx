import { CreateOrUpdateRerankerDialog } from './create-or-update-reranker';
import { CreateOrUpdateLLMDialog } from './create-or-update-llm';
import { ConfirmDialog } from './confirm';

export enum DialogType {
  CREATE_OR_UPDATE_RERANKER = 'create-or-update-reranker',
  CREATE_OR_UPDATE_LLM = 'create-or-update-llm',
  CONFIRM = 'confirm',
}

export const dialogs = {
  [DialogType.CREATE_OR_UPDATE_RERANKER]: CreateOrUpdateRerankerDialog,
  [DialogType.CREATE_OR_UPDATE_LLM]: CreateOrUpdateLLMDialog,
  [DialogType.CONFIRM]: ConfirmDialog,
} as const;
