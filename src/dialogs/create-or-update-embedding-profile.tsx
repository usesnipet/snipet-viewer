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
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";

import type { EmbeddingProfile, LLM } from "@/types";
import {
  getApiV1EmbeddingProfilesSuspenseQueryKey,
  useGetApiV1LlmsSuspense,
  usePatchApiV1EmbeddingProfilesId,
  usePostApiV1EmbeddingProfiles,
} from "@/gen";
import { DialogType } from ".";

export type CreateOrUpdateEmbeddingProfileDialogProps = {
  embeddingProfile?: EmbeddingProfile;
};

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  status: z.enum(["ACTIVE", "DEPRECATED"]),
  llmId: z.string().min(1, "LLM is required"),
  splitterStrategy: z.string().min(1, "Strategy is required"),
  chunkSize: z.coerce.number().int().positive("Chunk size must be > 0"),
  chunkOverlap: z.coerce.number().int().nonnegative("Chunk overlap must be >= 0"),
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
  const { invalidateQueries } = useQueryClient();

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
      splitterStrategy: String(initialSplitter.strategy ?? "recursive"),
      chunkSize: Number(initialSplitter.chunkSize ?? 1000),
      chunkOverlap: Number(initialSplitter.chunkOverlap ?? 200),

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

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      status: values.status,
      llmId: values.llmId,
      splitterSettings: {
        strategy: values.splitterStrategy,
        chunkSize: values.chunkSize,
        chunkOverlap: values.chunkOverlap,
      },
      preProcessorSettings: {
        toASCII: values.toASCII ?? false,
        removeNewlines: values.removeNewlines ?? false,
        removeWhitespace: values.removeWhitespace ?? false,
        trim: values.trim ?? false,
        lowercase: values.lowercase ?? false,
        uppercase: values.uppercase ?? false,
      },
    };

    if (isEditing && embeddingProfile) {
      updateEmbeddingProfile(
        { id: embeddingProfile.id, data: payload },
        {
          onSuccess: () => {
            toast({ title: "Embedding profile updated successfully" });
            invalidateQueries({ queryKey: getApiV1EmbeddingProfilesSuspenseQueryKey() });
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
          invalidateQueries({ queryKey: getApiV1EmbeddingProfilesSuspenseQueryKey() });
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                  name="splitterStrategy"
                  label="Strategy"
                  options={[
                    { label: "recursive", value: "recursive" },
                    { label: "token", value: "token" },
                    { label: "character", value: "character" },
                  ]}
                />
                <FormInput
                  name="chunkSize"
                  label="Chunk size"
                  type="number"
                  inputMode="numeric"
                />
                <FormInput
                  name="chunkOverlap"
                  label="Chunk overlap"
                  type="number"
                  inputMode="numeric"
                />
              </div>
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

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {isEditing ? "Update Profile" : "Create Profile"}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

