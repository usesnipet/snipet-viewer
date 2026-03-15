import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KnowledgeSource, KnowledgeMethod } from "../../../types/knowledge";
import { EmbeddingProfile } from "../../../types/embedding";
import { Input, Textarea, Select } from "../../../components/form-elements";
import { Button } from "../../../components/button";
import { KnowledgeService } from "../../../services/knowledge-service";
import { EmbeddingService } from "../../../services/embedding-service";
import { Modal } from "../../../components/modal";
import { EmbeddingForm } from "../../embeddings/_components/embedding-form";
import { Plus, Edit2 } from "lucide-react";
import { SchemaForm } from "../../../components/schema-form";

interface KnowledgeSourceFormProps {
  initialData: KnowledgeSource | null;
  onSuccess: () => void;
}

const baseSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]),
  type: z.string().min(1, "Type is required"),
  methods: z.array(z.string()).min(1, "Select at least one method"),
  embeddingProfileId: z.string().optional(),
});

type BaseValues = z.infer<typeof baseSchema>;

export function KnowledgeSourceForm({ initialData, onSuccess }: KnowledgeSourceFormProps) {
  const [schemas, setSchemas] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<EmbeddingProfile[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<EmbeddingProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [s, p] = await Promise.all([
      KnowledgeService.getSchemas(),
      EmbeddingService.getProfiles()
    ]);
    setSchemas(s);
    setProfiles(p);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BaseValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      status: initialData?.status || "ACTIVE",
      type: initialData?.type || "S3",
      methods: initialData?.methods || ["RAG"],
      embeddingProfileId: initialData?.embeddingProfileId || "",
    },
  });

  const selectedMethods = useWatch({ control, name: "methods" });
  const selectedType = useWatch({ control, name: "type" });
  const selectedProfileId = useWatch({ control, name: "embeddingProfileId" });

  const currentSchema = schemas.find(s => s.type === selectedType)?.configSchema;

  const onSubmit = async (baseValues: BaseValues, configValues: any) => {
    // This is now handled by handleFinalSubmit directly from SchemaForm
  };

  // Actually, I'll use a more direct approach for the submit button
  const handleFinalSubmit = async (baseValues: BaseValues, configValues: any) => {
    const finalData = {
      ...baseValues,
      config: JSON.stringify(configValues),
      ragConfig: initialData?.ragConfig || JSON.stringify({ chunkSize: 1000 }),
      searchConfig: initialData?.searchConfig || JSON.stringify({ limit: 10 }),
    };

    if (initialData) {
      await KnowledgeService.updateSource(initialData.id, finalData as any);
    } else {
      await KnowledgeService.createSource(finalData as any);
    }
    onSuccess();
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading schemas...</div>;

  return (
    <>
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Name" {...register("name")} error={errors.name?.message} />
          <Select
            label="Status"
            options={[
              { label: "Active", value: "ACTIVE" },
              { label: "Archived", value: "ARCHIVED" },
            ]}
            {...register("status")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Type"
            options={schemas.map(s => ({ label: s.type, value: s.type }))}
            {...register("type")}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Methods</label>
            <div className="flex gap-4 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              {["RAG", "SEARCH"].map((m) => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={m}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                    {...register("methods")}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{m}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {selectedMethods?.includes("RAG") && (
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-400">RAG Configuration</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[10px]"
                onClick={() => setIsProfileModalOpen(true)}
              >
                <Plus className="w-3 h-3 mr-1" /> New Profile
              </Button>
            </div>

            <Select
              label="Embedding Profile"
              options={[
                { label: "Select a profile...", value: "" },
                ...profiles.map(p => ({ label: p.name, value: p.id }))
              ]}
              {...register("embeddingProfileId")}
            />
          </div>
        )}

        {currentSchema && (
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <SchemaForm
              schema={currentSchema}
              formData={initialData?.config ? JSON.parse(initialData.config) : {}}
              onSubmit={(configData) => handleSubmit((baseData) => handleFinalSubmit(baseData, configData))()}
              submitLabel={initialData ? "Update Source" : "Create Source"}
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Create Embedding Profile"
      >
        <EmbeddingForm
          initialData={null}
          onSuccess={() => {
            setIsProfileModalOpen(false);
            fetchData();
          }}
        />
      </Modal>
    </>
  );
}
