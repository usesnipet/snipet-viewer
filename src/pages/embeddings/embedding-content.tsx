import { useState, useEffect } from "react";
import { EmbeddingProfile } from "../../types/embedding";
import { EmbeddingService } from "../../services/embedding-service";
import { EmbeddingList } from "./_components/embedding-list";
import { EmbeddingForm } from "./_components/embedding-form";
import { Modal } from "../../components/modal";

export function EmbeddingContent() {
  const [profiles, setProfiles] = useState<EmbeddingProfile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<EmbeddingProfile | null>(null);

  const fetchProfiles = async () => {
    const data = await EmbeddingService.getProfiles();
    setProfiles([...data]);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleCreate = () => {
    setEditingProfile(null);
    setIsModalOpen(true);
  };

  const handleEdit = (profile: EmbeddingProfile) => {
    setEditingProfile(profile);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await EmbeddingService.deleteProfile(id);
    fetchProfiles();
  };

  return (
    <div className="space-y-8">
      <EmbeddingList
        profiles={profiles}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProfile ? "Edit Embedding Profile" : "Create Embedding Profile"}
      >
        <EmbeddingForm
          initialData={editingProfile}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchProfiles();
          }}
        />
      </Modal>
    </div>
  );
}
