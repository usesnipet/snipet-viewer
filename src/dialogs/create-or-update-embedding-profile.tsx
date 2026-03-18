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
  useGetApiV1Llms,
  useGetApiV1LlmsSchema,
  useGetApiV1LlmsSuspense,
  usePatchApiV1EmbeddingProfilesId,
  usePostApiV1EmbeddingProfiles,
} from "@/gen";
import { DialogType } from ".";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export type CreateOrUpdateEmbeddingProfileDialogProps = {
  embeddingProfile?: EmbeddingProfile;
};

const embeddingProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  status: z.enum(["ACTIVE", "DEPRECATED"]),
  llmId: z.string().min(1, "LLM is required"),
  splitterType: z.string().min(1, "Splitter type is required"),
  splitterSettings: z.unknown(),
  toASCII: z.boolean().optional(),
  removeNewlines: z.boolean().optional(),
  removeWhitespace: z.boolean().optional(),
  trim: z.boolean().optional(),
  lowercase: z.boolean().optional(),
  uppercase: z.boolean().optional(),
});

type FormValues = z.infer<typeof embeddingProfileSchema>;

export const CreateOrUpdateEmbeddingProfileDialog = ({
  embeddingProfile,
}: CreateOrUpdateEmbeddingProfileDialogProps) => {
  const { toast } = useToast();
  const { closeDialog, openDialog } = useDialog();
  const queryClient = useQueryClient();

  const isEditing = embeddingProfile != null;

  const { data: rawLlms } = useGetApiV1LlmsSuspense({ });
  const llms = rawLlms as unknown as LLM[] | undefined;

  const llmOptions = useMemo(
    () =>
      (llms ?? []).map((l) => ({
        label: `${l.name ?? "Unnamed"} (${(l as any).config?.model ?? "—"})`,
        value: l.id,
      })),
    [llms]
  );

  const initialSplitter = embeddingProfile?.splitterSettings ?? {};
  const initialPre = embeddingProfile?.preProcessorSettings ?? {};

  const form = useForm<FormValues>({
    resolver: zodResolver(embeddingProfileSchema),
    defaultValues: {
      name: embeddingProfile?.name ?? "",
      status: embeddingProfile?.status ?? "ACTIVE",
      llmId: embeddingProfile?.llmId ?? "",
      splitterType: embeddingProfile?.splitterType ?? "",
      splitterSettings: embeddingProfile?.splitterSettings ?? {},
      toASCII: initialPre.toASCII ?? false,
      removeNewlines: initialPre.removeNewlines ?? true,
      removeWhitespace: initialPre.removeWhitespace ?? false,
      trim: initialPre.trim ?? true,
      lowercase: initialPre.lowercase ?? true,
      uppercase: initialPre.uppercase ?? false,
    },
  });

  const { mutate: createEmbeddingProfile } = usePostApiV1EmbeddingProfiles();
  const { mutate: updateEmbeddingProfile } = usePatchApiV1EmbeddingProfilesId();
  const { data: splitterSchemas = [] } = useGetApiV1EmbeddingProfilesSplitterSchema();

  const selectedSplitterType = useWatch({ control: form.control, name: "splitterType" });
  const currentSchema = splitterSchemas.find((s) => s.targetId === selectedSplitterType)?.schema ?? null;
  const selectedLLMId = useWatch({ control: form.control, name: "llmId" });
  const currentLLM = llms.find((s) => s.id === selectedLLMId) ?? null;

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      status: values.status,
      llmId: values.llmId,
      splitterType: values.splitterType,
      splitterSettings: values.splitterSettings,
      preProcessorSettings: {
        toASCII: values.toASCII,
        removeNewlines: values.removeNewlines,
        removeWhitespace: values.removeWhitespace,
        trim: values.trim,
        lowercase: values.lowercase,
        uppercase: values.uppercase,
      },
    };

    if (isEditing && embeddingProfile) {
      updateEmbeddingProfile(
        { id: embeddingProfile.id, data: payload as any },
        {
          onSuccess: () => {
            toast({ title: "Embedding profile updated successfully" });
            queryClient.invalidateQueries({
              queryKey: getApiV1EmbeddingProfilesSuspenseQueryKey(),
            });
            closeDialog(DialogType.CREATE_OR_UPDATE_EMBEDDING_PROFILE);
          },
          onError: () => toast({ title: "Failed to update embedding profile", variant: "destructive" })
        }
      );
      return;
    }

    createEmbeddingProfile(
      { data: payload as any },
      {
        onSuccess: () => {
          toast({ title: "Embedding profile created successfully" });
          queryClient.invalidateQueries({
            queryKey: getApiV1EmbeddingProfilesSuspenseQueryKey(),
          });
          closeDialog(DialogType.CREATE_OR_UPDATE_EMBEDDING_PROFILE);
        },
        onError: () => toast({ title: "Failed to create embedding profile", variant: "destructive" })
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
        <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
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

          <FormSelect
            name="llmId"
            label="Embedding LLM"
            options={llmOptions}
            action={{
              icon: <Settings />,
              size: "icon-lg",
              variant: "outline",
              disabled: !currentLLM,
              onClick: () => {
                if (!currentLLM) return;
                openDialog({
                  type: DialogType.CREATE_OR_UPDATE_LLM,
                  props: {
                    llm: currentLLM
                  },
                });
              },
            }}
          />

          <FormSelect
            name="splitterType"
            label="Splitter type"
            options={splitterSchemas.map((s) => ({
              label: s.targetId,
              value: s.targetId,
            }))}
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
                    title: `Edit ${selectedSplitterType} splitter configuration`,
                    description: `Configure the ${selectedSplitterType} splitter.`,
                    schema: currentSchema,
                    formData: initialSplitter,
                    submitLabel: "Save",
                    onSubmit: configData => {
                      form.setValue("splitterSettings", configData);
                      closeDialog(DialogType.SCHEMA_FORM);
                    },
                  },
                });
              },
            }}
          />

          <div className="space-y-6">
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
          <div className="flex justify-end pt-4 gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {isEditing ? "Update Profile" : "Create Profile"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => closeDialog(DialogType.CREATE_OR_UPDATE_EMBEDDING_PROFILE)}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

