import { useState, useEffect } from "react";
import { KnowledgeSourceList } from "./_components/knowledge-source-list";
import { KnowledgeService } from "../../services/knowledge-service";
import { KnowledgeSource } from "../../types/knowledge";
import { Modal } from "../../components/modal";
import { KnowledgeSourceForm } from "./_components/knowledge-source-form";
import { Sidebar } from "../../components/sidebar";
import { Loader2 } from "lucide-react";

export function KnowledgeSourcePage() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<KnowledgeSource | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const s = await KnowledgeService.getSources();
    setSources([...s]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSource = () => {
    setEditingSource(null);
    setIsSourceModalOpen(true);
  };

  const handleEditSource = (source: KnowledgeSource) => {
    setEditingSource(source);
    setIsSourceModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto space-y-10">
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Knowledge Sources</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your data sources and ingestion pipelines.</p>
          </header>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <section className="space-y-8">
              <KnowledgeSourceList
                sources={sources}
                onEdit={handleEditSource}
                onCreate={handleCreateSource}
              />
            </section>
          )}
        </div>
      </main>

      <Modal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        title={editingSource ? "Edit Knowledge Source" : "Create Knowledge Source"}
      >
        <KnowledgeSourceForm
          initialData={editingSource}
          onSuccess={() => {
            setIsSourceModalOpen(false);
            fetchData();
          }}
        />
      </Modal>
    </div>
  );
}
