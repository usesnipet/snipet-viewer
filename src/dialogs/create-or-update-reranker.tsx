import { RerankerForm } from '@/pages/reranker/_components/reranker-form';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDialog } from '@/hooks/use-dialog';

import { DialogType } from './';

import type { RerankerConfig } from '@/types/reranker';

export type CreateOrUpdateRerankerDialogProps = {
  reranker?: RerankerConfig;
};

export const CreateOrUpdateRerankerDialog = ({ reranker }: CreateOrUpdateRerankerDialogProps) => {
  const { closeDialog } = useDialog();

  const isEditing = !!reranker;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Re-ranker' : 'Add Re-ranker'}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? 'Update an existing re-ranker configuration.'
            : 'Create a new re-ranker configuration.'}
        </DialogDescription>
      </DialogHeader>

      <RerankerForm
        initialData={reranker ?? null}
        onSuccess={() => {
          closeDialog(DialogType.CREATE_OR_UPDATE_RERANKER);
        }}
      />
    </DialogContent>
  );
};


