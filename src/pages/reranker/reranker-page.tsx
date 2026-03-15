import { useState, useEffect } from "react";
import { Sidebar } from "../../components/sidebar";
import { RerankerList } from "./_components/reranker-list";
import { RerankerForm } from "./_components/reranker-form";
import { RerankerService } from "../../services/reranker-service";
import { RerankerConfig } from "../../types/reranker";
import { Modal } from "../../components/modal";
import { Loader2 } from "lucide-react";

export function RerankerPage() {
  const [rerankers, setRerankers] = useState<RerankerConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReranker, setEditingReranker] = useState<RerankerConfig | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const data = await RerankerService.getRerankers();
    setRerankers([...data]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setEditingReranker(null);
    setIsModalOpen(true);
  };

  const handleEdit = (reranker: RerankerConfig) => {
    setEditingReranker(reranker);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this re-ranker configuration?")) {
      await RerankerService.deleteReranker(id);
      fetchData();
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto space-y-10">
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Re-rankers</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Configure models to refine search results and improve precision.</p>
          </header>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <RerankerList
              rerankers={rerankers}
              onCreate={handleCreate}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReranker ? "Edit Re-ranker" : "Add Re-ranker"}
      >
        <RerankerForm
          initialData={editingReranker}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchData();
          }}
        />
      </Modal>
    </div>
  );
}
