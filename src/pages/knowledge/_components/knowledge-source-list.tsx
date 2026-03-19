import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2, Database } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  getApiKnowledgeSourcesQueryKey,
  useDeleteApiKnowledgeSourcesId,
  useGetApiKnowledgeSourcesSuspense,
} from "@/hooks/api";
import { DialogType } from "@/dialogs";
import { useDialog } from "@/hooks/use-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { useCallback, useMemo } from "react";
import type { KnowledgeSource } from "@/types";

const columnHelper = createColumnHelper<KnowledgeSource>();

function KnowledgeSourceRowActions({
  source,
  onEdit,
  onDelete,
}: {
  source: KnowledgeSource;
  onEdit: (s: KnowledgeSource) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button variant="ghost" size="sm" onClick={() => onEdit(source)}>
        <Edit2 className="w-3.5 h-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(source.id)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

export function KnowledgeSourceList() {
  const queryClient = useQueryClient();
  const { data: rawSources, error } = useGetApiKnowledgeSourcesSuspense();
  const sources = (rawSources as unknown as KnowledgeSource[]) ?? [];
  const { mutate: deleteSource } = useDeleteApiKnowledgeSourcesId();
  const { openDialog, closeDialog } = useDialog();
  const { toast } = useToast();

  const handleEdit = useCallback(
    (source: KnowledgeSource) => {
      openDialog({
        type: DialogType.CREATE_OR_UPDATE_KNOWLEDGE_SOURCE,
        props: { source },
      });
    },
    [openDialog]
  );

  const handleDelete = useCallback(
    (id: string) => {
      openDialog({
        type: DialogType.CONFIRM,
        props: {
          title: "Delete Knowledge Source",
          description: "Are you sure you want to delete this knowledge source?",
          confirm: {
            text: "Delete",
            action: () => {
              deleteSource(
                { id },
                {
                  onSuccess: () => {
                    toast({ title: "Knowledge Source deleted successfully" });
                    queryClient.invalidateQueries({
                      queryKey: getApiKnowledgeSourcesQueryKey(),
                    });
                    closeDialog(DialogType.CONFIRM);
                  },
                  onError: () => {
                    toast({
                      title: "Failed to delete Knowledge Source",
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
    [openDialog, closeDialog, deleteSource, queryClient, toast]
  );

  const columns = useMemo<ColumnDef<KnowledgeSource, unknown>[]>(
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
      columnHelper.accessor("type", {
        header: "Type",
        cell: ({ getValue }) => (
          <Badge variant="secondary">{getValue()}</Badge>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => (
          <Badge variant={getValue() === "ACTIVE" ? "default" : "outline"}>
            {getValue()}
          </Badge>
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
          <KnowledgeSourceRowActions
            source={row.original}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ),
      }),
    ],
    [handleEdit, handleDelete]
  );

  return (
    <DataTable<KnowledgeSource>
      columns={columns}
      data={sources}
      getRowId={(r) => r.id}
      error={!!error}
      errorMessage="Failed to load knowledge sources."
      emptyMessage="No knowledge sources configured yet."
      actionsColumnId="actions"
    />
  );
}
