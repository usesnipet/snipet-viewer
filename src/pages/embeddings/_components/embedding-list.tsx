import { useState, useEffect } from "react";
import { EmbeddingProfile } from "../../../types/embedding";
import { EmbeddingService } from "../../../services/embedding-service";
import { Card, CardHeader, CardContent } from "../../../components/card";
import { Button } from "../../../components/button";
import { Badge } from "../../../components/badge";
import { Plus, Edit2, Trash2, Layers } from "lucide-react";
import { formatDate } from "../../../lib/utils";

interface EmbeddingListProps {
  profiles: EmbeddingProfile[];
  onCreate: () => void;
  onEdit: (profile: EmbeddingProfile) => void;
  onDelete: (id: string) => void;
}

export function EmbeddingList({ profiles, onCreate, onEdit, onDelete }: EmbeddingListProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      const newCounts: Record<string, number> = {};
      for (const p of profiles) {
        newCounts[p.id] = await EmbeddingService.getLinkedSourcesCount(p.id);
      }
      setCounts(newCounts);
    };
    fetchCounts();
  }, [profiles]);

  return (
    <Card>
      <CardHeader 
        title="Embedding Profiles" 
        description="Manage vectorization settings and linked models."
        action={
          <Button onClick={onCreate} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Profile
          </Button>
        }
      />
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Linked Sources</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 dark:text-slate-600 italic">
                    No embedding profiles found.
                  </td>
                </tr>
              ) : (
                profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                          <Layers className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{profile.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={profile.status === "ACTIVE" ? "success" : "neutral"}>
                        {profile.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {counts[profile.id] || 0} sources
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(profile.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(profile)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(profile.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
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
