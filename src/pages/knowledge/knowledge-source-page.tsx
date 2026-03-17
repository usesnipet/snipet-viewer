import { PageLayout } from "@/components/layout/page";
import { Loader2, Plus } from "lucide-react";
import { KnowledgeSourceList } from "./_components/knowledge-source-list";
import { Button } from "@/components/ui/button";
import { DialogType } from "@/dialogs";
import { useCallback } from "react";
import { useDialog } from "@/hooks/use-dialog";

export function KnowledgeSourcePage() {
  const { openDialog } = useDialog();

  const handleCreate = useCallback(() => {
    openDialog({
      type: DialogType.CREATE_OR_UPDATE_KNOWLEDGE_SOURCE,
      props: { source: undefined },
    });
  }, [openDialog]);

  return (
    <PageLayout
      title="Knowledge Sources"
      description="Manage your data sources and ingestion pipelines."
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }
      actions={
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Add Source
        </Button>
      }
    >
      <KnowledgeSourceList />
    </PageLayout>
  );
}
