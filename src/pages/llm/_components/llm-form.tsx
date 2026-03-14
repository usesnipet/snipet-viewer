import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LLMConfig, LLMProvider, LLMPurpose } from "../../../types/llm";
import { Input, Select } from "../../../components/form-elements";
import { Button } from "../../../components/button";
import { LLMService } from "../../../services/llm-service";
import { SchemaForm } from "../../../components/schema-form";

interface LLMFormProps {
  initialData: LLMConfig | null;
  onSuccess: () => void;
}

const baseSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  provider: z.string().min(1, "Provider is required"),
  purpose: z.enum(["COMPLETION", "EMBEDDING"]),
});

type BaseValues = z.infer<typeof baseSchema>;

export function LLMForm({ initialData, onSuccess }: LLMFormProps) {
  const [schemas, setSchemas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    LLMService.getSchemas().then((s) => {
      setSchemas(s);
      setLoading(false);
    });
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
      provider: initialData?.provider || "OPENAI",
      purpose: initialData?.purpose || "COMPLETION",
    },
  });

  const selectedProvider = useWatch({ control, name: "provider" });
  const currentSchema = schemas.find(s => s.provider === selectedProvider)?.configSchema;

  const onSubmit = async (baseValues: BaseValues, configValues: any) => {
    const finalData = {
      ...baseValues,
      config: configValues,
    };

    if (initialData) {
      await LLMService.updateLLM(initialData.id, finalData as any);
    } else {
      await LLMService.createLLM(finalData as any);
    }
    onSuccess();
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading schemas...</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Configuration Name"
          placeholder="e.g. Production OpenAI"
          {...register("name")}
          error={errors.name?.message}
        />
        <Select
          label="Purpose"
          options={[
            { label: "Completion", value: "COMPLETION" },
            { label: "Embedding", value: "EMBEDDING" },
          ]}
          {...register("purpose")}
        />
        <Select
          label="Provider"
          options={schemas.map(s => ({ label: s.provider, value: s.provider }))}
          {...register("provider")}
        />
      </div>

      {currentSchema && (
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <SchemaForm
            schema={currentSchema}
            formData={initialData?.config}
            onSubmit={(configData) => handleSubmit((baseData) => onSubmit(baseData, configData))()}
            submitLabel={initialData ? "Update LLM" : "Create LLM"}
          />
        </div>
      )}
    </div>
  );
}
