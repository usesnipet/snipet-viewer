import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/form/input";
import { FormSelect } from "@/components/form/select";
import { FormSwitch } from "@/components/form/switch";
import { useDialog } from "@/hooks/use-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import z from "zod";

import type { EmbeddingProfile, LLM } from "@/types";
import {
  getApiV1EmbeddingProfilesSuspenseQueryKey,
  useGetApiV1EmbeddingProfilesSplitterSchema,
  useGetApiV1LlmsSuspense,
  usePatchApiV1EmbeddingProfilesId,
  usePostApiV1EmbeddingProfiles,
} from "@/gen";
import { SchemaForm } from "@/components/schema-form";
import { DialogType } from ".";

export type CreateOrUpdateEmbeddingProfileDialogProps = {
  embeddingProfile?: EmbeddingProfile;
};

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  status: z.enum(["ACTIVE", "DEPRECATED"]),
  llmId: z.string().min(1, "LLM is required"),
  splitterType: z.string().min(1, "Splitter type is required"),
  toASCII: z.boolean().optional(),
  removeNewlines: z.boolean().optional(),
  removeWhitespace: z.boolean().optional(),
  trim: z.boolean().optional(),
  lowercase: z.boolean().optional(),
  uppercase: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const CreateOrUpdateEmbeddingProfileDialog = ({
  embeddingProfile,
}: CreateOrUpdateEmbeddingProfileDialogProps) => {
  const { toast } = useToast();
  const { closeDialog } = useDialog();
  const queryClient = useQueryClient();

  const isEditing = embeddingProfile != null;

  const { data: rawLlms } = useGetApiV1LlmsSuspense();
  const llms = rawLlms as unknown as LLM[] | undefined;

  const llmOptions = useMemo(
    () =>
      (llms ?? []).map((l) => ({
        label: `${l.name ?? "Unnamed"} (${(l as any).config?.model ?? "—"})`,
        value: l.id,
      })),
    [llms]
  );

  const initialSplitter = (embeddingProfile?.splitterSettings ?? {}) as any;
  const initialPre = (embeddingProfile?.preProcessorSettings ?? {}) as any;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: embeddingProfile?.name ?? "",
      status: embeddingProfile?.status ?? "ACTIVE",
      llmId: embeddingProfile?.llmId ?? "",
      splitterType: String((embeddingProfile as any)?.splitterType ?? ""),

      toASCII: Boolean(initialPre.toASCII ?? false),
      removeNewlines: Boolean(initialPre.removeNewlines ?? true),
      removeWhitespace: Boolean(initialPre.removeWhitespace ?? false),
      trim: Boolean(initialPre.trim ?? true),
      lowercase: Boolean(initialPre.lowercase ?? true),
      uppercase: Boolean(initialPre.uppercase ?? false),
    },
  });

  const { mutate: createEmbeddingProfile } = usePostApiV1EmbeddingProfiles();
  const { mutate: updateEmbeddingProfile } = usePatchApiV1EmbeddingProfilesId();


  const { data: splitterSchemas = [] } = useGetApiV1EmbeddingProfilesSplitterSchema();

  const selectedSplitterType = useWatch({ control: form.control, name: "splitterType" });
  const currentSchema = splitterSchemas.find((s) => s.targetId === selectedSplitterType)?.schema ?? null;

  const onSubmit = (values: FormValues, splitterConfig: any) => {
    const payload = {
      name: values.name,
      status: values.status,
      llmId: values.llmId,
      splitterSettings: splitterConfig,
      // splitterType is sent at top-level to backend
      splitterType: values.splitterType,
      preProcessorSettings: {
        toASCII: values.toASCII ?? true,
        removeNewlines: values.removeNewlines ?? true,
        removeWhitespace: values.removeWhitespace ?? true,
        trim: values.trim ?? true,
        lowercase: values.lowercase ?? true,
        uppercase: values.uppercase ?? false,
      },
    };

    if (isEditing && embeddingProfile) {
      updateEmbeddingProfile(
        { id: embeddingProfile.id, data: payload },
        {
          onSuccess: () => {
            toast({ title: "Embedding profile updated successfully" });
            queryClient.invalidateQueries({
              queryKey: getApiV1EmbeddingProfilesSuspenseQueryKey(),
            });
            closeDialog(DialogType.CREATE_OR_UPDATE_EMBEDDING_PROFILE);
          },
          onError: () => {
            toast({ title: "Failed to update embedding profile", variant: "destructive" });
          },
        }
      );
      return;
    }

    createEmbeddingProfile(
      { data: payload },
      {
        onSuccess: () => {
          toast({ title: "Embedding profile created successfully" });
          queryClient.invalidateQueries({
            queryKey: getApiV1EmbeddingProfilesSuspenseQueryKey(),
          });
          closeDialog(DialogType.CREATE_OR_UPDATE_EMBEDDING_PROFILE);
        },
        onError: () => {
          toast({ title: "Failed to create embedding profile", variant: "destructive" });
        },
      }
    );
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Embedding Profile" : "Add Embedding Profile"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update an existing embedding profile."
            : "Create a new embedding profile."}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput name="name" label="Profile Name" />
            <FormSelect
              name="status"
              label="Status"
              options={[
                { label: "Active", value: "ACTIVE" },
                { label: "Deprecated", value: "DEPRECATED" },
              ]}
            />
          </div>

          <FormSelect name="llmId" label="Embedding LLM" options={llmOptions} />

          <div className="space-y-6">
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Splitter
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <FormSelect
                  name="splitterType"
                  label="Splitter type"
                  options={splitterSchemas.map((s) => ({
                    label: s.targetId,
                    value: s.targetId,
                  }))}
                />
              </div>
              {currentSchema && (
                <div className="mt-4">
                  <SchemaForm
                    schema={currentSchema as any}
                    formData={initialSplitter}
                    onSubmit={(configData) =>
                      form.handleSubmit((baseData) => onSubmit(baseData, configData))()
                    }
                    submitLabel={isEditing ? "Update Profile" : "Create Profile"}
                    loading={form.formState.isSubmitting}
                  />
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Pre-processor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormSwitch name="toASCII" label="To ASCII" />
                <FormSwitch name="removeNewlines" label="Remove newlines" />
                <FormSwitch name="removeWhitespace" label="Remove whitespace" />
                <FormSwitch name="trim" label="Trim" />
                <FormSwitch name="lowercase" label="Lowercase" />
                <FormSwitch name="uppercase" label="Uppercase" />
              </div>
            </div>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

