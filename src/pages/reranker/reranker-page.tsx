import { PageLayout } from "@/components/layout/page";
import { RerankerList } from "./_components/reranker-list";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { useCallback } from "react";
import { DialogType } from "@/dialogs";

export function RerankerPage() {
  const { openDialog } = useDialog();

  const handleCreate = useCallback(() => {
    openDialog({ type: DialogType.CREATE_OR_UPDATE_RERANKER, props: { } });
  }, [openDialog]);

  return (
    <PageLayout
      title="Re-rankers"
      description="Configure models to refine search results and improve precision."
      actions={
        <Button onClick={handleCreate} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Re-ranker
        </Button>
      }
    >
      <RerankerList />
    </PageLayout>
  );
}
