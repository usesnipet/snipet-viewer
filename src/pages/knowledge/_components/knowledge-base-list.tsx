import { Card, CardHeader, CardContent } from "../../../components/card";
import { Button } from "../../../components/button";
import { Plus, Edit2, Trash2, Database } from "lucide-react";
import { KnowledgeBase } from "@/types";
import { formatDate } from "@/lib/utils";

interface KnowledgeBaseListProps {
  bases: KnowledgeBase[];
  onCreate: () => void;
  onEdit: (base: KnowledgeBase) => void;
  onDelete: (id: string) => void;
}

export function KnowledgeBaseList({ bases, onCreate, onEdit, onDelete }: KnowledgeBaseListProps) {
  return (
    <Card>
      <CardHeader
        title="Knowledge Bases"
        description="Logical groupings of data sources for specific AI contexts."
        action={
          <Button onClick={onCreate} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Base
          </Button>
        }
      />
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sources</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Updated At</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 dark:text-slate-600 italic">
                    No knowledge bases found. Create one to get started.
                  </td>
                </tr>
              ) : (
                bases.map((base) => (
                  <tr key={base.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                          <Database className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{base.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {base.description || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-medium">
                        {base.sourceIds.length} sources
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(base.updatedAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(base)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(base.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
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
