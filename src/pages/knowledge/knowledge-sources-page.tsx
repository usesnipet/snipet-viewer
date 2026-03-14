import { useState, useEffect } from "react";
import { KnowledgeSourceList } from "./_components/knowledge-source-list";
import { KnowledgeSourceVersionList } from "./_components/knowledge-source-version-list";
import { KnowledgeService } from "../../services/knowledge-service";
import { KnowledgeSource } from "../../types/knowledge";
import { Modal } from "../../components/modal";
import { KnowledgeSourceForm } from "./_components/knowledge-source-form";
import { Sidebar } from "../../components/sidebar";
import { Loader2 } from "lucide-react";

export function KnowledgeSourcesPage() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<KnowledgeSource | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const s = await KnowledgeService.getSources();
    setSources([...s]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setEditingSource(null);
    setIsModalOpen(true);
  };

  const handleEdit = (source: KnowledgeSource) => {
    setEditingSource(source);
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto space-y-10">
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Knowledge Sources</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Raw data origins like S3, APIs, or Databases.</p>
          </header>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="space-y-8">
              <KnowledgeSourceList 
                sources={sources} 
                onEdit={handleEdit} 
                onCreate={handleCreate}
                onSelect={setSelectedSourceId}
                selectedId={selectedSourceId}
              />

              {selectedSourceId && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <KnowledgeSourceVersionList sourceId={selectedSourceId} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingSource ? "Edit Knowledge Source" : "Create Knowledge Source"}
      >
        <KnowledgeSourceForm 
          initialData={editingSource} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchData();
          }} 
        />
      </Modal>
    </div>
  );
}
