import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDialog } from "@/hooks/use-dialog";

import { Reranker } from "@/types";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { FormInput } from "@/components/form/input";
import { FormSelect } from "@/components/form/select";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { DialogType } from ".";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { getApiRerankersQueryKey, useGetApiRerankersSchema, usePatchApiRerankersId, usePostApiRerankers } from "@/hooks/api";

export type CreateOrUpdateRerankerDialogProps = {
  reranker?: Reranker;
};
const rerankerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  type: z.string().min(1, "Type is required"),
  config: z.unknown(),
});

type RerankerValues = z.infer<typeof rerankerSchema>;

export const CreateOrUpdateRerankerDialog = ({ reranker }: CreateOrUpdateRerankerDialogProps) => {
  const { toast } = useToast();
  const { closeDialog, openDialog } = useDialog();

  const isEditing = !!reranker;
  const form = useForm<RerankerValues>({
    resolver: zodResolver(rerankerSchema),
    defaultValues: {
      name: reranker?.name ?? "",
      type: reranker?.type ?? "",
      config: reranker?.config ?? {},
    },
  });

  const queryClient = useQueryClient();

  const { data: schemas = [] } = useGetApiRerankersSchema();

  const { mutate: createReranker } = usePostApiRerankers();
  const { mutate: updateReranker } = usePatchApiRerankersId();

  const selectedType = useWatch({ control: form.control, name: "type" });
  const currentSchema = schemas.find((s) => s.targetId === selectedType)?.schema;

  const onSubmit = async (values: RerankerValues) => {
    const data = values;

    if (isEditing && reranker) {
      updateReranker(
        { id: reranker.id, data },
        {
          onSuccess: () => {
            toast({ title: "Re-ranker updated successfully" });
            queryClient.invalidateQueries({ queryKey: getApiRerankersQueryKey() });
            closeDialog(DialogType.CREATE_OR_UPDATE_RERANKER);
          },
          onError: () => toast({ title: "Failed to update re-ranker", variant: "destructive" }),
        }
      );
    } else {
      createReranker(
        { data },
        {
          onSuccess: () => {
            toast({ title: "Re-ranker created successfully" });
            queryClient.invalidateQueries({ queryKey: getApiRerankersQueryKey() });
            closeDialog(DialogType.CREATE_OR_UPDATE_RERANKER);
          },
          onError: () => toast({ title: "Failed to create re-ranker", variant: "destructive" }),
        }
      );
    }
  };


  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Re-ranker' : 'Add Re-ranker'}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? 'Update an existing re-ranker configuration.'
            : 'Create a new re-ranker configuration.'}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
          <FormInput name="name" label="Re-ranker Name" />
          <FormSelect
            label="Type"
            options={schemas.map((s) => ({ label: s.targetId, value: s.targetId }))}
            name="type"
            fieldclassname="flex-1"
            action={{
              icon: <Settings />,
              size: "icon-lg",
              variant: "outline",
              disabled: !currentSchema,
              onClick: () => {
                if (!currentSchema) return;
                openDialog({
                  type: DialogType.SCHEMA_FORM,
                  props: {
                    title: `Edit ${selectedType} configuration`,
                    description: `Configure the ${selectedType} reranker.`,
                    schema: currentSchema,
                    formData: (reranker as any)?.config ?? {},
                    submitLabel: "Save",
                    onSubmit: (configData: any) => {
                      form.setValue("config", configData);
                      closeDialog(DialogType.SCHEMA_FORM);
                    },
                  },
                });
              },
            }}
          />

          <Button type="submit">{isEditing ? "Update Re-ranker" : "Create Re-ranker"}</Button>
        </form>
      </Form>
    </DialogContent>
  );
};


