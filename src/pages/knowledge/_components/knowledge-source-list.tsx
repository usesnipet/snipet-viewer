import { KnowledgeSource } from "../../../types/knowledge";
import { Card, CardHeader, CardContent } from "../../../components/card";
import { Button } from "../../../components/button";
import { Badge } from "../../../components/badge";
import { Plus, Edit2, Archive, ExternalLink } from "lucide-react";
import { formatDate, cn } from "../../../lib/utils";

interface KnowledgeSourceListProps {
  sources: KnowledgeSource[];
  onCreate: () => void;
  onEdit: (source: KnowledgeSource) => void;
}

export function KnowledgeSourceList({ sources, onCreate, onEdit }: KnowledgeSourceListProps) {
  return (
    <Card>
      <CardHeader 
        title="Knowledge Sources" 
        description="Raw data origins like S3, APIs, or Databases."
        action={
          <Button onClick={onCreate} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Source
          </Button>
        }
      />
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Methods</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Updated At</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 dark:text-slate-600 italic">
                    No knowledge sources found.
                  </td>
                </tr>
              ) : (
                sources.map((source) => (
                  <tr 
                    key={source.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-slate-100">{source.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="info">{source.type}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={source.status === "ACTIVE" ? "success" : "neutral"}>
                        {source.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {source.methods.map(m => (
                          <span key={m} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-bold text-slate-600 dark:text-slate-400">
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(source.updatedAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(source)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Archive className="w-3.5 h-3.5" />
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
