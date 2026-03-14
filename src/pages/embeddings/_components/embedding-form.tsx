import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { embeddingProfileSchema, EmbeddingProfileFormValues } from "../../../schemas/embedding-profile-schema";
import { EmbeddingProfile } from "../../../types/embedding";
import { LLMConfig } from "../../../types/llm";
import { LLMService } from "../../../services/llm-service";
import { EmbeddingService } from "../../../services/embedding-service";
import { Input, Select, Textarea } from "../../../components/form-elements";
import { Button } from "../../../components/button";

interface EmbeddingFormProps {
  initialData: EmbeddingProfile | null;
  onSuccess: () => void;
}

export function EmbeddingForm({ initialData, onSuccess }: EmbeddingFormProps) {
  const [embeddingLLMs, setEmbeddingLLMs] = useState<LLMConfig[]>([]);

  useEffect(() => {
    const fetchLLMs = async () => {
      const allLLMs = await LLMService.getLLMs();
      setEmbeddingLLMs(allLLMs.filter(l => l.purpose === "EMBEDDING"));
    };
    fetchLLMs();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmbeddingProfileFormValues>({
    resolver: zodResolver(embeddingProfileSchema),
    defaultValues: {
      name: initialData?.name || "",
      status: initialData?.status || "ACTIVE",
      llmId: initialData?.llmId || "",
      splitterSettings: initialData?.splitterSettings || JSON.stringify({ strategy: "recursive", chunkSize: 1000, chunkOverlap: 200 }, null, 2),
      preProcessorSettings: initialData?.preProcessorSettings || JSON.stringify({ removeStopWords: true, lowercase: true }, null, 2),
    },
  });

  const onSubmit = async (values: EmbeddingProfileFormValues) => {
    if (initialData) {
      await EmbeddingService.updateProfile(initialData.id, values);
    } else {
      await EmbeddingService.createProfile(values);
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input label="Profile Name" {...register("name")} error={errors.name?.message} />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Status"
          options={[
            { label: "Active", value: "ACTIVE" },
            { label: "Deprecated", value: "DEPRECATED" },
          ]}
          {...register("status")}
        />
        <Select
          label="Embedding LLM"
          options={embeddingLLMs.map(l => ({ label: `${l.name} (${l.model})`, value: l.id }))}
          {...register("llmId")}
          error={errors.llmId?.message}
        />
      </div>

      <Textarea 
        label="Splitter Settings (JSON)" 
        {...register("splitterSettings")} 
        error={errors.splitterSettings?.message} 
        className="font-mono text-xs"
      />

      <Textarea 
        label="Pre-Processor Settings (JSON)" 
        {...register("preProcessorSettings")} 
        error={errors.preProcessorSettings?.message} 
        className="font-mono text-xs"
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Profile" : "Create Profile"}
        </Button>
      </div>
    </form>
  );
}
