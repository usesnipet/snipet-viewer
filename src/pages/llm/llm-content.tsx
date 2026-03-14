import { useState, useEffect } from "react";
import { LLMConfig } from "../../types/llm";
import { LLMService } from "../../services/llm-service";
import { LLMList } from "./_components/llm-list";
import { LLMForm } from "./_components/llm-form";
import { Modal } from "../../components/modal";

export function LLMContent() {
  const [llms, setLLMs] = useState<LLMConfig[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLLM, setEditingLLM] = useState<LLMConfig | null>(null);

  const fetchLLMs = async () => {
    const data = await LLMService.getLLMs();
    setLLMs([...data]);
  };

  useEffect(() => {
    fetchLLMs();
  }, []);

  const handleCreate = () => {
    setEditingLLM(null);
    setIsModalOpen(true);
  };

  const handleEdit = (llm: LLMConfig) => {
    setEditingLLM(llm);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await LLMService.deleteLLM(id);
    fetchLLMs();
  };

  return (
    <div className="space-y-8">
      <LLMList 
        llms={llms} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        onCreate={handleCreate} 
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLLM ? "Edit LLM Configuration" : "Add New LLM Provider"}
      >
        <LLMForm 
          initialData={editingLLM} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchLLMs();
          }} 
        />
      </Modal>
    </div>
  );
}
