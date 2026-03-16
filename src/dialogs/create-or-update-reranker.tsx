import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDialog } from '@/hooks/use-dialog';

import { Reranker } from '@/types';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useGetApiV1RerankersSchema } from '@/gen';
import { FormInput } from '@/components/form/input';
import { FormSelect } from '@/components/form/select';
import { SchemaForm } from '@/components/schema-form';
import { Form } from '@/components/ui/form';

export type CreateOrUpdateRerankerDialogProps = {
  reranker?: Reranker;
};
const baseSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  type: z.string().min(1, "Type is required"),
});

type BaseValues = z.infer<typeof baseSchema>;

export const CreateOrUpdateRerankerDialog = ({ reranker }: CreateOrUpdateRerankerDialogProps) => {

  const isEditing = !!reranker;
  const form = useForm<BaseValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      name: reranker?.name || "",
      type: reranker?.type || "",
    },
  });

  const { data: schemas = [] } = useGetApiV1RerankersSchema();

  const selectedType = useWatch({ control: form.control, name: "type" });
  console.log(selectedType);
  const currentSchema = schemas.find(s => s.targetId === selectedType)?.schema;

  const onSubmit = async (baseValues: BaseValues, configValues: any) => {
    console.log("submit", baseValues, configValues);
    // const finalData = {
    //   ...baseValues,
    //   config: configValues,
    // };
  };

  console.log(currentSchema);

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
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput name="name" label="Re-ranker Name" />
            <FormSelect
              label="Type"
              options={schemas.map(s => ({ label: s.targetId, value: s.targetId }))}
              name='type'
            />
          </div>

          {currentSchema && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <SchemaForm
                schema={currentSchema}
                formData={reranker?.config}
                onSubmit={(configData) => form.handleSubmit((baseData) => onSubmit(baseData, configData))()}
                submitLabel={reranker ? "Update Re-ranker" : "Create Re-ranker"}
              />
            </div>
          )}
        </div>
      </Form>
    </DialogContent>
  );
};


