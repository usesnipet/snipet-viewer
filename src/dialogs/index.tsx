import { CreateOrUpdateRerankerDialog } from './create-or-update-reranker';
import { ConfirmDialog } from './confirm';

export enum DialogType {
  CREATE_OR_UPDATE_RERANKER = 'create-or-update-reranker',
  CONFIRM = 'confirm',
}

export const dialogs = {
  [DialogType.CREATE_OR_UPDATE_RERANKER]: CreateOrUpdateRerankerDialog,
  [DialogType.CONFIRM]: ConfirmDialog,
} as const;
