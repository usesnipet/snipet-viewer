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
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { DialogType } from ".";
import { useQueryClient } from "@tanstack/react-query";
import { LLM, LLMType } from "@/types";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export type CreateOrUpdateLLMDialogProps = {
  llm?: LLM;
};

const llmSchema = z.object({
  name: z.string().max(255).trim().optional(),
  type: z.enum(LLMType),
  provider: z.string().min(1, "Provider is required"),
  config: z.unknown(),
  maxLimits: z.unknown(),
});

type LLMSchema = z.infer<typeof llmSchema>;

export const CreateOrUpdateLLMDialog = ({ llm }: CreateOrUpdateLLMDialogProps) => {
  const { toast } = useToast();
  const { closeDialog, openDialog } = useDialog();

  const isEditing = !!llm;
  const form = useForm<LLMSchema>({
    resolver: zodResolver(llmSchema),
    defaultValues: {
      name: llm?.name ?? "",
      type: llm?.type ?? LLMType.TEXT_GENERATION,
      provider: llm?.provider ?? "",
      config: llm?.config ?? {},
      maxLimits: llm?.maxLimits ?? {},
    },
  });

  const queryClient = useQueryClient();

  const { data: schemas = [] } = useGetApiV1LlmsSchema();
  const { mutate: createLLM } = usePostApiV1Llms();
  const { mutate: updateLLM } = usePatchApiV1LlmsId();

  const selectedProvider = useWatch({ control: form.control, name: "provider" });
  const currentSchema = schemas.find((s) => s.targetId === selectedProvider)?.schema;

  const onSubmit = async (data: LLMSchema) => {
    if (isEditing && llm) {
      updateLLM(
        { id: llm.id, data: data },
        {
          onSuccess: () => {
            toast({ title: "LLM updated successfully" });
            queryClient.invalidateQueries({ queryKey: getApiV1LlmsQueryKey() });
            closeDialog(DialogType.CREATE_OR_UPDATE_LLM);
          },
          onError: () => toast({ title: "Failed to update LLM", variant: "destructive" }),
        }
      );
    } else {
      createLLM(
        { data },
        {
          onSuccess: () => {
            toast({ title: "LLM created successfully" });
            queryClient.invalidateQueries({ queryKey: getApiV1LlmsQueryKey() });
            closeDialog(DialogType.CREATE_OR_UPDATE_LLM);
          },
          onError: () => toast({ title: "Failed to create LLM", variant: "destructive" }),
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
        <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
          <FormInput name="name" label="LLM Name" />
          <FormSelect
            name="type"
            label="LLM Type"
            options={Object.values(LLMType).map((t) => ({ label: t, value: t }))}
          />
          <FormSelect
            label="Provider"
            name="provider"
            options={schemas.map((s) => ({ label: s.targetId, value: s.targetId }))}
            fieldclassname="flex-1"
            action={{
              icon: <Settings />,
              size: "icon-lg",
              variant: "outline",
              disabled: !currentSchema,
              onClick: () => {
                openDialog({
                  type: DialogType.SCHEMA_FORM,
                  props: {
                    title: `Edit ${selectedProvider} Configuration`,
                    description: `Configure the ${selectedProvider} LLM.`,
                    schema: currentSchema,
                    onSubmit: (configData) => {
                      form.setValue("config", configData);
                      closeDialog(DialogType.SCHEMA_FORM);
                    },
                    submitLabel: "Save",
                    formData: llm?.config,
                  },
                });
              }
            }}
          />
          <Button type="submit">{isEditing ? "Update LLM" : "Create LLM"}</Button>
        </form>
      </Form>
    </DialogContent>
  );
};
