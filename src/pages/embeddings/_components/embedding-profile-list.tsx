import { useCallback, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Layers, Edit2, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DialogType } from "@/dialogs";
import { useDialog } from "@/hooks/use-dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import type { EmbeddingProfile, KnowledgeSource } from "@/types";
import {
  getEmbeddingProfilesQueryKey,
  useDeleteApiEmbeddingProfilesId,
  useGetApiEmbeddingProfilesSuspense,
  useGetApiKnowledgeSourcesSuspense,
} from "@/hooks/api";

const columnHelper = createColumnHelper<EmbeddingProfile>();

function EmbeddingProfileRowActions({
  embeddingProfile,
  onEdit,
  onDelete,
}: {
  embeddingProfile: EmbeddingProfile;
  onEdit: (p: EmbeddingProfile) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button variant="ghost" size="sm" onClick={() => onEdit(embeddingProfile)}>
        <Edit2 className="w-3.5 h-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(embeddingProfile.id)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

export function EmbeddingProfileList() {
  const queryClient = useQueryClient();
  const { openDialog, closeDialog } = useDialog();
  const { toast } = useToast();

  // NOTE: The generated OpenAPI types for this list endpoint are currently incorrect.
  // We type-assert to the app's local EmbeddingProfile interface used elsewhere.
  const { data: rawProfiles, error: profilesError } = useGetApiEmbeddingProfilesSuspense({ includeLLM: true });
  const embeddingProfiles = rawProfiles as unknown as EmbeddingProfile[] | undefined;

  const { data: rawSources } = useGetApiKnowledgeSourcesSuspense();
  const knowledgeSources = rawSources as unknown as KnowledgeSource[] | undefined;

  const linkedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of embeddingProfiles ?? []) counts[p.id] = 0;
    for (const s of knowledgeSources ?? []) {
      const profileId = (s as any).embeddingProfileId as string | undefined;
      if (profileId != null) counts[profileId] = (counts[profileId] ?? 0) + 1;
    }
    return counts;
  }, [embeddingProfiles, knowledgeSources]);

  const { mutate: deleteEmbeddingProfile } = useDeleteApiEmbeddingProfilesId();

  const handleEdit = useCallback(
    (embeddingProfile: EmbeddingProfile) => {
      openDialog({
        type: DialogType.CREATE_OR_UPDATE_EMBEDDING_PROFILE,
        props: { embeddingProfile },
      });
    },
    [openDialog]
  );

  const handleDelete = useCallback(
    (id: string) => {
      openDialog({
        type: DialogType.CONFIRM,
        props: {
          title: "Delete embedding profile",
          description: "Are you sure you want to delete this embedding profile?",
          confirm: {
            text: "Delete",
            action: () => {
              deleteEmbeddingProfile(
                { id },
                {
                  onSuccess: () => {
                    toast({ title: "Embedding profile deleted successfully" });
                    queryClient.invalidateQueries({
                      queryKey: getEmbeddingProfilesQueryKey(),
                    });
                    closeDialog(DialogType.CONFIRM);
                  },
                  onError: () => {
                    toast({
                      title: "Failed to delete embedding profile",
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
    [openDialog, closeDialog, deleteEmbeddingProfile, queryClient, toast]
  );

  const columns = useMemo<ColumnDef<EmbeddingProfile, unknown>[]>(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {getValue() ?? "—"}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => (
          <Badge variant={getValue() === "ACTIVE" ? "default" : "secondary"}>
            {getValue() ?? "—"}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: "linkedSources",
        header: "Linked Sources",
        cell: ({ row }) => (
          <Badge variant="outline">
            {linkedCounts[row.original.id] ?? 0} sources
          </Badge>
        ),
      }),
      columnHelper.display({
        id: "llm",
        header: "LLM",
        cell: ({ row }) => (
          row.original.llm?.name ?? "—"
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
          <EmbeddingProfileRowActions
            embeddingProfile={row.original}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ),
      }),
    ],
    [handleEdit, handleDelete, linkedCounts]
  );

  return (
    <DataTable<EmbeddingProfile>
      columns={columns}
      data={embeddingProfiles ?? []}
      getRowId={(p) => p.id}
      error={!!profilesError}
      errorMessage="Failed to load embedding profiles."
      emptyMessage="No embedding profiles configured yet."
      actionsColumnId="actions"
    />
  );
}

