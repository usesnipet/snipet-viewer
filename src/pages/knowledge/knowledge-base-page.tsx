import { PageLayout } from "@/components/layout/page";
import { Loader2, Plus } from "lucide-react";
import { KnowledgeBaseList } from "./_components/knowledge-base-list";
import { Button } from "@/components/ui/button";
import { DialogType } from "@/dialogs";
import { useCallback } from "react";
import { useDialog } from "@/hooks/use-dialog";

export function KnowledgeBasePage() {
  const { openDialog } = useDialog();

  const handleCreate = useCallback(() => {
    openDialog({
      type: DialogType.CREATE_OR_UPDATE_KNOWLEDGE_BASE,
      props: { base: undefined },
    });
  }, [openDialog]);

  return (
    <PageLayout
      title="Knowledge Bases"
      description="Manage logical groupings of knowledge for your AI agents."
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }
      actions={
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Add Base
        </Button>
      }
    >
      <KnowledgeBaseList />
    </PageLayout>
  );
}
