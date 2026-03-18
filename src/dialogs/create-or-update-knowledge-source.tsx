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
  useGetApiV1EmbeddingProfilesId,
} from "@/gen";
import { FormInput } from "@/components/form/input";
import { FormSelect } from "@/components/form/select";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { DialogType } from ".";
import { useQueryClient } from "@tanstack/react-query";
import type { KnowledgeSource, EmbeddingProfile } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormTextarea } from "@/components/form/textarea";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export type CreateOrUpdateKnowledgeSourceDialogProps = {
  source?: KnowledgeSource;
};

const knowledgeSourceSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  type: z.string().min(1, "Type is required"),
  embeddingProfileId: z.uuid("Embedding Profile is required").optional(),
  config: z.unknown(),
});

type KnowledgeSourceValues = z.infer<typeof knowledgeSourceSchema>;

export const CreateOrUpdateKnowledgeSourceDialog = ({
  source,
}: CreateOrUpdateKnowledgeSourceDialogProps) => {
  const { toast } = useToast();
  const { closeDialog, openDialog } = useDialog();
  const queryClient = useQueryClient();

  const isEditing = !!source;

  const form = useForm<KnowledgeSourceValues>({
    resolver: zodResolver(knowledgeSourceSchema),
    defaultValues: {
      name: source?.name ?? "",
      description: source?.description ?? "",
      status: source?.status ?? "ACTIVE",
      type: source?.type ?? "",
      embeddingProfileId: source?.embeddingProfileId ?? undefined,
      config: (source as any)?.config ?? {},
    },
  });

  const { data: schemas = [] } = useGetApiV1KnowledgeSourcesSchema();
  const embeddingProfileId = form.watch("embeddingProfileId");
  const {
    data: selectedEmbeddingProfile,
    isLoading: isEmbeddingProfileLoading,
    isError: isEmbeddingProfileError,
  } = useGetApiV1EmbeddingProfilesId(embeddingProfileId ?? "", {}, {
    query: { enabled: !!embeddingProfileId },
  });
  const canEditEmbeddingProfile =
    !!embeddingProfileId && !isEmbeddingProfileLoading && !isEmbeddingProfileError && !!selectedEmbeddingProfile;
  const { data: embeddingProfilesRaw } = useGetApiV1EmbeddingProfilesSuspense();
  const embeddingProfiles =
    (embeddingProfilesRaw as unknown as EmbeddingProfile[]) ?? [];
  const ADD_NEW_EMBEDDING_PROFILE_VALUE = "__add_new_embedding_profile__";
  const embeddingProfileOptions = [
    ...embeddingProfiles.map((p) => ({
      label: p.name,
      value: p.id,
    })),
    { label: "Add new embedding profile...", value: ADD_NEW_EMBEDDING_PROFILE_VALUE },
  ];

  const { mutate: createSource } = usePostApiV1KnowledgeSources();
  const { mutate: updateSource } = usePatchApiV1KnowledgeSourcesId();

  const selectedType = useWatch({ control: form.control, name: "type" });
  const currentSchema = schemas.find((s) => s.targetId === selectedType)?.schema ?? null;

  const onSubmit = async (values: KnowledgeSourceValues) => {
    const baseValues = values;
    const configValues = values.config;
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
            queryClient.invalidateQueries({ queryKey: getApiV1KnowledgeSourcesQueryKey() });
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
          queryClient.invalidateQueries({ queryKey: getApiV1KnowledgeSourcesQueryKey() });
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
          <form className="space-y-8 p-2" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput name="name" label="Name" />
              <FormSelect
                label="Status"
                name="status"
                options={[
                  { label: "ACTIVE", value: "ACTIVE" },
                  { label: "ARCHIVED", value: "ARCHIVED" },
                ]}
              />
            </div>
            <FormTextarea name="description" label="Description" />
            <FormSelect
              label="Type"
              name="type"
              options={schemas.map((s) => ({ label: s.targetId, value: s.targetId }))}
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
                      description: `Configure the ${selectedType} knowledge source.`,
                      schema: currentSchema,
                      formData: (source as any)?.config ?? {},
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
            <FormSelect
              label="Embedding Profile"
              name="embeddingProfileId"
              options={embeddingProfileOptions}
              onValueChange={(value) => {
                if (value !== ADD_NEW_EMBEDDING_PROFILE_VALUE) return undefined;
                openDialog({
                  type: DialogType.CREATE_OR_UPDATE_EMBEDDING_PROFILE,
                  props: {},
                });
                return null;
              }}
              action={{
                icon: <Settings />,
                size: "icon-lg",
                variant: "outline",
                disabled: !canEditEmbeddingProfile,
                onClick: () => {
                  if (!canEditEmbeddingProfile || !selectedEmbeddingProfile) return;
                  openDialog({
                    type: DialogType.CREATE_OR_UPDATE_EMBEDDING_PROFILE,
                    props: { embeddingProfile: selectedEmbeddingProfile as EmbeddingProfile },
                  });
                },
              }}
            />

            <Button type="submit">{isEditing ? "Update Source" : "Create Source"}</Button>
          </form>
        </Form>
      </ScrollArea>
    </DialogContent>
  );
};

