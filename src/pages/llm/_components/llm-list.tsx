import { createColumnHelper } from "@tanstack/react-table";
import { Plus, Edit2, Trash2, Cpu } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  getApiV1LlmsQueryKey,
  useDeleteApiV1LlmsId,
  useGetApiV1LlmsSuspense,
} from "@/gen";
import { DialogType } from "@/dialogs";
import { useDialog } from "@/hooks/use-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { useCallback, useMemo } from "react";
import { LLM } from "@/types";

const columnHelper = createColumnHelper<LLM>();

function LLMRowActions({
  llm,
  onEdit,
  onDelete,
}: {
  llm: LLM;
  onEdit: (l: LLM) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button variant="ghost" size="sm" onClick={() => onEdit(llm)}>
        <Edit2 className="w-3.5 h-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(llm.id)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

export function LLMList() {
  const { invalidateQueries } = useQueryClient();
  const { data: llms, error } = useGetApiV1LlmsSuspense();
  const { mutate: deleteLLM } = useDeleteApiV1LlmsId();
  const { openDialog, closeDialog } = useDialog();
  const { toast } = useToast();

  const handleCreate = useCallback(() => {
    openDialog({
      type: DialogType.CREATE_OR_UPDATE_LLM,
      props: { llm: undefined },
    });
  }, [openDialog]);

  const handleEdit = useCallback(
    (llm: LLM) => {
      openDialog({
        type: DialogType.CREATE_OR_UPDATE_LLM,
        props: { llm },
      });
    },
    [openDialog]
  );

  const handleDelete = useCallback(
    (id: string) => {
      openDialog({
        type: DialogType.CONFIRM,
        props: {
          title: "Delete LLM",
          description: "Are you sure you want to delete this LLM?",
          confirm: {
            text: "Delete",
            action: () => {
              deleteLLM(
                { id },
                {
                  onSuccess: () => {
                    toast({ title: "LLM deleted successfully" });
                    invalidateQueries({ queryKey: getApiV1LlmsQueryKey() });
                    closeDialog(DialogType.CONFIRM);
                  },
                  onError: () => {
                    toast({
                      title: "Failed to delete LLM",
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
    [openDialog, closeDialog, deleteLLM, invalidateQueries, toast]
  );

  const columns = useMemo<ColumnDef<LLM, unknown>[]>(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {getValue() ?? "—"}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("provider", {
        header: "Provider",
        cell: ({ getValue }) => <Badge variant="secondary">{getValue()}</Badge>,
      }),
      columnHelper.accessor((row) => row.config?.model as string | undefined, {
        id: "model",
        header: "Model",
        cell: ({ getValue }) => (
          <span className="text-sm font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            {getValue() ?? "—"}
          </span>
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
          <LLMRowActions
            llm={row.original}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ),
      }),
    ],
    [handleEdit, handleDelete]
  );

  return (
    <DataTable<LLM>
      columns={columns}
      data={llms ?? []}
      getRowId={(r) => r.id}
      error={!!error}
      errorMessage="Failed to load LLMs."
      emptyMessage="No LLMs configured yet."
      actionsColumnId="actions"
    />
  );
}
