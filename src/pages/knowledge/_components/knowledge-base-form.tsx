import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { knowledgeBaseSchema, KnowledgeBaseFormValues } from "../../../schemas/knowledge-base-schema";
import { KnowledgeBase, KnowledgeSource } from "../../../types/knowledge";
import { Input, Textarea } from "../../../components/form-elements";
import { Button } from "../../../components/button";
import { KnowledgeService } from "../../../services/knowledge-service";

interface KnowledgeBaseFormProps {
  initialData: KnowledgeBase | null;
  sources: KnowledgeSource[];
  onSuccess: () => void;
}

export function KnowledgeBaseForm({ initialData, sources, onSuccess }: KnowledgeBaseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<KnowledgeBaseFormValues>({
    resolver: zodResolver(knowledgeBaseSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      sourceIds: initialData?.sourceIds || [],
    },
  });

  const onSubmit = async (values: KnowledgeBaseFormValues) => {
    if (initialData) {
      await KnowledgeService.updateBase(initialData.id, values);
    } else {
      await KnowledgeService.createBase(values);
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Name"
        placeholder="e.g. Customer Support Context"
        {...register("name")}
        error={errors.name?.message}
      />
      
      <Textarea
        label="Description"
        placeholder="Briefly describe what this base is for..."
        {...register("description")}
        error={errors.description?.message}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Linked Sources</label>
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-lg">
          {sources.map((source) => (
            <label key={source.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer transition-colors">
              <input
                type="checkbox"
                value={source.id}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                {...register("sourceIds")}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900">{source.name}</span>
                <span className="text-xs text-slate-500">{source.type}</span>
              </div>
            </label>
          ))}
          {sources.length === 0 && (
            <p className="text-xs text-slate-400 p-2 italic">No sources available. Create one first.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Base" : "Create Base"}
        </Button>
      </div>
    </form>
  );
}
