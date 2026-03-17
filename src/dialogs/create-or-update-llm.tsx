import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDialog } from "@/hooks/use-dialog";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  getApiV1LlmsQueryKey,
  useGetApiV1LlmsSchema,
  usePatchApiV1LlmsId,
  usePostApiV1Llms,
} from "@/gen";
import { FormInput } from "@/components/form/input";
import { FormSelect } from "@/components/form/select";
import { SchemaForm } from "@/components/schema-form";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { DialogType } from ".";
import { useQueryClient } from "@tanstack/react-query";
import { LLM } from "@/types";

export type CreateOrUpdateLLMDialogProps = {
  llm?: LLM;
};

const baseSchema = z.object({
  name: z.string().max(255).optional(),
  provider: z.string().min(1, "Provider is required"),
});

type BaseValues = z.infer<typeof baseSchema>;

export const CreateOrUpdateLLMDialog = ({ llm }: CreateOrUpdateLLMDialogProps) => {
  const { toast } = useToast();
  const { closeDialog } = useDialog();

  const isEditing = !!llm;
  const form = useForm<BaseValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      name: llm?.name ?? "",
      provider: llm?.provider ?? "",
    },
  });

  const queryClient = useQueryClient();

  const { data: schemas = [] } = useGetApiV1LlmsSchema();
  const { mutate: createLLM } = usePostApiV1Llms();
  const { mutate: updateLLM } = usePatchApiV1LlmsId();

  const selectedProvider = useWatch({ control: form.control, name: "provider" });
  const currentSchema = schemas.find((s) => s.targetId === selectedProvider)?.schema;

  const onSubmit = async (baseValues: BaseValues, configValues: any) => {
    const name =
      baseValues.name != null && String(baseValues.name).trim() !== ""
        ? baseValues.name
        : null;
    if (isEditing && llm) {
      updateLLM(
        {
          id: llm.id,
          data: {
            name,
            provider: baseValues.provider,
            config: configValues,
            maxLimits: llm.maxLimits,
            currentLimits: llm.currentLimits,
          },
        },
        {
          onSuccess: () => {
            toast({ title: "LLM updated successfully" });
            queryClient.invalidateQueries({ queryKey: getApiV1LlmsQueryKey() });
            closeDialog(DialogType.CREATE_OR_UPDATE_LLM);
          },
          onError: () => {
            toast({ title: "Failed to update LLM", variant: "destructive" });
          },
        }
      );
    } else {
      createLLM(
        {
          data: {
            name,
            provider: baseValues.provider,
            config: configValues,
            maxLimits: {},
          },
        },
        {
          onSuccess: () => {
            toast({ title: "LLM created successfully" });
            queryClient.invalidateQueries({ queryKey: getApiV1LlmsQueryKey() });
            closeDialog(DialogType.CREATE_OR_UPDATE_LLM);
          },
          onError: () => {
            toast({ title: "Failed to create LLM", variant: "destructive" });
          },
        }
      );
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit LLM" : "Add LLM"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update an existing LLM configuration."
            : "Create a new LLM configuration."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput name="name" label="LLM Name" />
            <FormSelect
              label="Provider"
              name="provider"
              options={schemas.map((s) => ({ label: s.targetId, value: s.targetId }))}
            />
          </div>

          {currentSchema && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <SchemaForm
                schema={currentSchema}
                formData={llm?.config}
                onSubmit={(configData) =>
                  form.handleSubmit((baseData) => onSubmit(baseData, configData))()
                }
                submitLabel={isEditing ? "Update LLM" : "Create LLM"}
              />
            </div>
          )}
        </div>
      </Form>
    </DialogContent>
  );
};
