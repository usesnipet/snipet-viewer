import type { DialogComponents } from '@/context/dialog';

import { CreateOrUpdateKnowledgeDialog } from './create-or-update-knowledge';

export enum DialogType {
  CREATE_OR_UPDATE_KNOWLEDGE = "create-knowledge",
}

export const dialogs = {
  [DialogType.CREATE_OR_UPDATE_KNOWLEDGE]: CreateOrUpdateKnowledgeDialog,
} satisfies DialogComponents;