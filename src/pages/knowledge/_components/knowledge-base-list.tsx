import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2, Database } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  getApiV1KnowledgeBasesQueryKey,
  useDeleteApiV1KnowledgeBasesId,
  useGetApiV1KnowledgeBasesSuspense,
} from "@/gen";
import { DialogType } from "@/dialogs";
import { useDialog } from "@/hooks/use-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { useCallback, useMemo } from "react";
import type { KnowledgeBase } from "@/types";

const columnHelper = createColumnHelper<KnowledgeBase>();

function KnowledgeBaseRowActions({
  base,
  onEdit,
  onDelete,
}: {
  base: KnowledgeBase;
  onEdit: (b: KnowledgeBase) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button variant="ghost" size="sm" onClick={() => onEdit(base)}>
        <Edit2 className="w-3.5 h-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(base.id)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

export function KnowledgeBaseList() {
  const { invalidateQueries } = useQueryClient();
  const { data: bases, error } = useGetApiV1KnowledgeBasesSuspense();
  const { mutate: deleteBase } = useDeleteApiV1KnowledgeBasesId();
  const { openDialog, closeDialog } = useDialog();
  const { toast } = useToast();

  const handleEdit = useCallback(
    (base: KnowledgeBase) => {
      openDialog({
        type: DialogType.CREATE_OR_UPDATE_KNOWLEDGE_BASE,
        props: { base },
      });
    },
    [openDialog]
  );

  const handleDelete = useCallback(
    (id: string) => {
      openDialog({
        type: DialogType.CONFIRM,
        props: {
          title: "Delete Knowledge Base",
          description: "Are you sure you want to delete this knowledge base?",
          confirm: {
            text: "Delete",
            action: () => {
              deleteBase(
                { id },
                {
                  onSuccess: () => {
                    toast({ title: "Knowledge Base deleted successfully" });
                    invalidateQueries({
                      queryKey: getApiV1KnowledgeBasesQueryKey(),
                    });
                    closeDialog(DialogType.CONFIRM);
                  },
                  onError: () => {
                    toast({
                      title: "Failed to delete Knowledge Base",
                      variant: "destructive",
                    });
                    closeDialog(DialogType.CONFIRM);
                  },
                }
              );
            },
          },
          cancel: {
            text: "Cancel",
            action: () => closeDialog(DialogType.CONFIRM),
          },
        },
      });
    },
    [openDialog, closeDialog, deleteBase, invalidateQueries, toast]
  );

  const columns = useMemo<ColumnDef<KnowledgeBase, unknown>[]>(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Database className="w-4 h-4" />
            </div>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: ({ getValue }) => (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {getValue() ?? "—"}
          </span>
        ),
      }),
      columnHelper.accessor("updatedAt", {
        header: "Updated At",
        cell: ({ getValue }) => (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {formatDate(getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <KnowledgeBaseRowActions
            base={row.original}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ),
      }),
    ],
    [handleEdit, handleDelete]
  );

  return (
    <DataTable<KnowledgeBase>
      columns={columns}
      data={bases ?? []}
      getRowId={(r) => r.id}
      error={!!error}
      errorMessage="Failed to load knowledge bases."
      emptyMessage="No knowledge bases configured yet."
      actionsColumnId="actions"
    />
  );
}
