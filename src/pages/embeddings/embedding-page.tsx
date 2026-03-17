import { PageLayout } from "@/components/layout/page";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";
import { useDialog } from "@/hooks/use-dialog";
import { DialogType } from "@/dialogs";
import { EmbeddingProfileList } from "./_components/embedding-profile-list";

export function EmbeddingPage() {
  const { openDialog } = useDialog();

  const handleCreate = useCallback(() => {
    openDialog({
      type: DialogType.CREATE_OR_UPDATE_EMBEDDING_PROFILE,
      props: { embeddingProfile: undefined },
    });
  }, [openDialog]);

  return (
    <PageLayout
      title="Embedding Profiles"
      description="Configure how data is chunked and processed before vectorization."
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }
      actions={
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Add profile
        </Button>
      }
    >
      <EmbeddingProfileList />
    </PageLayout>
  );
}
