import { Card, CardHeader, CardContent } from "../../../components/card";
import { Button } from "../../../components/button";
import { Badge } from "../../../components/badge";
import { Plus, Edit2, Trash2, Layers } from "lucide-react";
import { formatDate } from "../../../lib/utils";
import { getApiV1RerankersQueryKey, useDeleteApiV1RerankersId, useGetApiV1RerankersSuspense } from "@/gen";
import { DialogType } from "@/dialogs";
import { useDialog } from "@/hooks/use-dialog";
import { useToast } from "@/hooks/use-toast";
import { Reranker } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

export function RerankerList() {
  const { invalidateQueries } = useQueryClient();
  const { data: rerankers, error } = useGetApiV1RerankersSuspense();
  const { mutate: deleteReranker } = useDeleteApiV1RerankersId();
  const { openDialog, closeDialog } = useDialog();
  const { toast } = useToast();

  const handleCreate = () => {
    openDialog({
      type: DialogType.CREATE_OR_UPDATE_RERANKER,
      props: { reranker: undefined },
    });
  };

  const handleEdit = (reranker: Reranker) => {
    openDialog({
      type: DialogType.CREATE_OR_UPDATE_RERANKER,
      props: { reranker },
    });
  };

  const handleDelete = (id: string) => {
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
                  invalidateQueries({ queryKey: getApiV1RerankersQueryKey() });
                  closeDialog(DialogType.CONFIRM);
                },
                onError: () => {
                  toast({ title: "Failed to delete re-ranker", variant: "destructive" });
                  closeDialog(DialogType.CONFIRM);
                },
              }
            )
          },
        },
        cancel: {
          text: "Cancel",
          action: () => {
            closeDialog(DialogType.CONFIRM);
          },
        },
      }
    })
  };

  return (
    <Card>
      <CardHeader
        title="Configured Re-rankers"
        description="Active Re-ranker connections for your search pipelines."
        action={
          <Button onClick={handleCreate} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Re-ranker
          </Button>
        }
      />
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Model</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 dark:text-slate-600 italic">
                    Failed to load re-rankers.
                  </td>
                </tr>
              ) : rerankers?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 dark:text-slate-600 italic">
                    No Re-rankers configured yet.
                  </td>
                </tr>
              ) : (
              rerankers?.map((reranker) => (
                  <tr key={reranker.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                          <Layers className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{reranker.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="info">{reranker.type}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {reranker.config.model}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(reranker.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(reranker)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(reranker.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
