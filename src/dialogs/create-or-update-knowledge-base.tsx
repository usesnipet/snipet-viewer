import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDialog } from "@/hooks/use-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  getApiKnowledgeBasesQueryKey,
  usePatchApiKnowledgeBasesId,
  usePostApiKnowledgeBases,
} from "@/hooks/api";
import { FormInput } from "@/components/form/input";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DialogType } from ".";
import { useQueryClient } from "@tanstack/react-query";
import type { KnowledgeBase } from "@/types";

export type CreateOrUpdateKnowledgeBaseDialogProps = {
  base?: KnowledgeBase;
};

const baseSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
});

type BaseValues = z.infer<typeof baseSchema>;

export const CreateOrUpdateKnowledgeBaseDialog = ({
  base,
}: CreateOrUpdateKnowledgeBaseDialogProps) => {
  const { toast } = useToast();
  const { closeDialog } = useDialog();
  const queryClient = useQueryClient();

  const isEditing = !!base;

  const form = useForm<BaseValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      name: base?.name ?? "",
      description: base?.description ?? "",
    },
  });

  const { mutate: createBase } = usePostApiKnowledgeBases();
  const { mutate: updateBase } = usePatchApiKnowledgeBasesId();

  const onSubmit = (values: BaseValues) => {
    const description =
      values.description != null && values.description.trim() !== ""
        ? values.description
        : null;

    if (isEditing && base) {
      updateBase(
        { id: base.id, data: { name: values.name, description } },
        {
          onSuccess: () => {
            toast({ title: "Knowledge Base updated successfully" });
            queryClient.invalidateQueries({ queryKey: getApiKnowledgeBasesQueryKey() });
            closeDialog(DialogType.CREATE_OR_UPDATE_KNOWLEDGE_BASE);
          },
          onError: () => {
            toast({
              title: "Failed to update Knowledge Base",
              variant: "destructive",
            });
          },
        }
      );
      return;
    }

    createBase(
      { data: { name: values.name, description } },
      {
        onSuccess: () => {
          toast({ title: "Knowledge Base created successfully" });
          queryClient.invalidateQueries({ queryKey: getApiKnowledgeBasesQueryKey() });
          closeDialog(DialogType.CREATE_OR_UPDATE_KNOWLEDGE_BASE);
        },
        onError: () => {
          toast({
            title: "Failed to create Knowledge Base",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Knowledge Base" : "Add Knowledge Base"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update an existing knowledge base."
            : "Create a new knowledge base."}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput name="name" label="Name" />
            <FormInput name="description" label="Description" />
          </div>
          <div className="flex justify-end">
            <Button type="submit">
              {isEditing ? "Update Base" : "Create Base"}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

