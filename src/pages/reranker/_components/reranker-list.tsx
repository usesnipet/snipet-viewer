import { createColumnHelper } from "@tanstack/react-table";
import { Edit2, Trash2, Layers } from "lucide-react";
import { formatDate } from "../../../lib/utils";
import {
  getApiV1RerankersQueryKey,
  useDeleteApiV1RerankersId,
  useGetApiV1RerankersSuspense,
} from "@/gen";
import { DialogType } from "@/dialogs";
import { useDialog } from "@/hooks/use-dialog";
import { useToast } from "@/hooks/use-toast";
import { Reranker } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { useCallback, useMemo } from "react";

const columnHelper = createColumnHelper<Reranker>();

function RerankerRowActions({
  reranker,
  onEdit,
  onDelete,
}: {
  reranker: Reranker;
  onEdit: (r: Reranker) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button variant="ghost" size="sm" onClick={() => onEdit(reranker)}>
        <Edit2 className="w-3.5 h-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(reranker.id)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

export function RerankerList() {
  const queryClient = useQueryClient();
  const { data: rerankers, error } = useGetApiV1RerankersSuspense();
  const { mutate: deleteReranker } = useDeleteApiV1RerankersId();
  const { openDialog, closeDialog } = useDialog();
  const { toast } = useToast();

  const handleEdit = useCallback(
    (reranker: Reranker) => {
      openDialog({
        type: DialogType.CREATE_OR_UPDATE_RERANKER,
        props: { reranker },
      });
    },
    [openDialog]
  );

  const handleDelete = useCallback(
    (id: string) => {
    openDialog({
      type: DialogType.CONFIRM,
      props: {
        title: "Delete Re-ranker",
        description: "Are you sure you want to delete this re-ranker?",
        confirm: {
          text: "Delete",
          action: () => {
            deleteReranker(
              { id },
              {
                onSuccess: () => {
                  toast({ title: "Re-ranker deleted successfully" });
                  queryClient.invalidateQueries({ queryKey: getApiV1RerankersQueryKey() });
                  closeDialog(DialogType.CONFIRM);
                },
                onError: () => {
                  toast({
                    title: "Failed to delete re-ranker",
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
          action: () => {
            closeDialog(DialogType.CONFIRM);
          },
        },
      },
    });
    },
    [openDialog, closeDialog, deleteReranker, queryClient, toast]
  );

  const columns = useMemo<ColumnDef<Reranker, unknown>[]>(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("type", {
        header: "Provider",
        cell: ({ getValue }) => <Badge variant="default">{getValue()}</Badge>,
      }),
      columnHelper.accessor((row) => row.config.model as string, {
        id: "model",
        header: "Model",
        cell: ({ getValue }) => (
          <Badge variant={getValue() ? "secondary" : "outline"}>{getValue() ?? "N/A"}</Badge>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created At",
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
          <RerankerRowActions
            reranker={row.original}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ),
      }),
    ],
    [handleEdit, handleDelete]
  );

  return (
    <DataTable<Reranker>
      columns={columns}
      data={rerankers ?? []}
      getRowId={(r) => r.id}
      error={!!error}
      errorMessage="Failed to load re-rankers."
      emptyMessage="No Re-rankers configured yet."
      actionsColumnId="actions"
    />
  );
}
