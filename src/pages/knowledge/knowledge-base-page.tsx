import { useState, useEffect } from "react";
import { KnowledgeBaseList } from "./_components/knowledge-base-list";
import { KnowledgeService } from "../../services/knowledge-service";
import { KnowledgeBase, KnowledgeSource } from "../../types/knowledge";
import { Modal } from "../../components/modal";
import { KnowledgeBaseForm } from "./_components/knowledge-base-form";
import { Sidebar } from "../../components/sidebar";
import { Loader2 } from "lucide-react";

export function KnowledgeBasePage() {
  const [bases, setBases] = useState<KnowledgeBase[]>([]);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isBaseModalOpen, setIsBaseModalOpen] = useState(false);
  const [editingBase, setEditingBase] = useState<KnowledgeBase | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [b, s] = await Promise.all([
      KnowledgeService.getBases(),
      KnowledgeService.getSources(),
    ]);
    setBases([...b]);
    setSources([...s]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBase = () => {
    setEditingBase(null);
    setIsBaseModalOpen(true);
  };

  const handleEditBase = (base: KnowledgeBase) => {
    setEditingBase(base);
    setIsBaseModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto space-y-10">
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Knowledge Bases</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage logical groupings of knowledge for your AI agents.</p>
          </header>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <section>
              <KnowledgeBaseList 
                bases={bases} 
                onEdit={handleEditBase} 
                onCreate={handleCreateBase}
                onDelete={async (id) => {
                  await KnowledgeService.deleteBase(id);
                  fetchData();
                }}
              />
            </section>
          )}
        </div>
      </main>

      <Modal 
        isOpen={isBaseModalOpen} 
        onClose={() => setIsBaseModalOpen(false)} 
        title={editingBase ? "Edit Knowledge Base" : "Create Knowledge Base"}
      >
        <KnowledgeBaseForm 
          initialData={editingBase} 
          sources={sources}
          onSuccess={() => {
            setIsBaseModalOpen(false);
            fetchData();
          }} 
        />
      </Modal>
    </div>
  );
}
