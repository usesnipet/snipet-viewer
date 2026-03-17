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
  getApiV1KnowledgeSourcesQueryKey,
  usePatchApiV1KnowledgeSourcesId,
  usePostApiV1KnowledgeSources,
  useGetApiV1EmbeddingProfilesSuspense,
  useGetApiV1KnowledgeSourcesSchema,
} from "@/gen";
import { FormInput } from "@/components/form/input";
import { FormSelect } from "@/components/form/select";
import { SchemaForm } from "@/components/schema-form";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { DialogType } from ".";
import { useQueryClient } from "@tanstack/react-query";
import type { KnowledgeSource, EmbeddingProfile } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormTextarea } from "@/components/form/textarea";

export type CreateOrUpdateKnowledgeSourceDialogProps = {
  source?: KnowledgeSource;
};

const baseSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  type: z.string().min(1, "Type is required"),
  embeddingProfileId: z.string().uuid("Embedding Profile is required").optional(),
});

type BaseValues = z.infer<typeof baseSchema>;

export const CreateOrUpdateKnowledgeSourceDialog = ({
  source,
}: CreateOrUpdateKnowledgeSourceDialogProps) => {
  const { toast } = useToast();
  const { closeDialog } = useDialog();
  const { invalidateQueries } = useQueryClient();

  const isEditing = !!source;

  const form = useForm<BaseValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      name: source?.name ?? "",
      description: source?.description ?? "",
      status: source?.status ?? "ACTIVE",
      type: source?.type ?? "",
      embeddingProfileId: source?.embeddingProfileId ?? undefined,
    },
  });

  const { data: schemas = [] } = useGetApiV1KnowledgeSourcesSchema();
  const { data: embeddingProfilesRaw } = useGetApiV1EmbeddingProfilesSuspense();
  const embeddingProfiles =
    (embeddingProfilesRaw as unknown as EmbeddingProfile[]) ?? [];

  const { mutate: createSource } = usePostApiV1KnowledgeSources();
  const { mutate: updateSource } = usePatchApiV1KnowledgeSourcesId();

  const selectedType = useWatch({ control: form.control, name: "type" });
  const currentSchema = schemas.find((s) => s.targetId === selectedType)?.schema ?? null;

  const onSubmit = async (baseValues: BaseValues, configValues: any) => {
    const description =
      baseValues.description != null && baseValues.description.trim() !== ""
        ? baseValues.description
        : null;

    if (isEditing && source) {
      updateSource(
        {
          id: source.id,
          data: {
            name: baseValues.name,
            description,
            status: baseValues.status,
            type: baseValues.type as any,
            config: configValues,
          },
        },
        {
          onSuccess: () => {
            toast({ title: "Knowledge Source updated successfully" });
            invalidateQueries({ queryKey: getApiV1KnowledgeSourcesQueryKey() });
            closeDialog(DialogType.CREATE_OR_UPDATE_KNOWLEDGE_SOURCE);
          },
          onError: () => {
            toast({
              title: "Failed to update Knowledge Source",
              variant: "destructive",
            });
          },
        }
      );
      return;
    }

    const embeddingProfileId = baseValues.embeddingProfileId;
    if (!embeddingProfileId) {
      toast({
        title: "Embedding Profile is required",
        variant: "destructive",
      });
      return;
    }

    createSource(
      {
        data: {
          name: baseValues.name,
          description,
          type: baseValues.type as any,
          config: configValues,
          embeddingProfileId,
        } as any,
      },
      {
        onSuccess: () => {
          toast({ title: "Knowledge Source created successfully" });
          invalidateQueries({ queryKey: getApiV1KnowledgeSourcesQueryKey() });
          closeDialog(DialogType.CREATE_OR_UPDATE_KNOWLEDGE_SOURCE);
        },
        onError: () => {
          toast({
            title: "Failed to create Knowledge Source",
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
          {isEditing ? "Edit Knowledge Source" : "Add Knowledge Source"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update an existing knowledge source configuration."
            : "Create a new knowledge source configuration."}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="max-h-[calc(100vh-200px)] pr-2">
        <Form {...form}>
          <div className="space-y-8 p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput name="name" label="Name" />
              <FormSelect
                label="Type"
                name="type"
                options={schemas.map((s) => ({ label: s.targetId, value: s.targetId }))}
              />
              <FormTextarea name="description" label="Description" fieldclassname="col-span-full" />
              <FormSelect
                label="Status"
                name="status"
                options={[
                  { label: "ACTIVE", value: "ACTIVE" },
                  { label: "ARCHIVED", value: "ARCHIVED" },
                ]}
              />
              <FormSelect
                label="Embedding Profile"
                name="embeddingProfileId"
                options={embeddingProfiles.map((p) => ({
                  label: p.name,
                  value: p.id,
                }))}
              />
            </div>

            {currentSchema && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <SchemaForm
                  schema={currentSchema}
                  formData={source?.config ?? {}}
                  onSubmit={(configData) =>
                    form.handleSubmit((baseData) =>
                      onSubmit(baseData, configData)
                    )()
                  }
                  submitLabel={isEditing ? "Update Source" : "Create Source"}
                />
              </div>
            )}
          </div>
        </Form>
      </ScrollArea>
    </DialogContent>
  );
};

