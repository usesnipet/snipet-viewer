import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDialog } from "@/hooks/use-dialog";
import { SchemaForm, SchemaFormProps } from "@/components/schema-form";
import { DialogType } from ".";
import { ScrollArea } from "@/components/ui/scroll-area";

export type SchemaFormDialogProps = Omit<SchemaFormProps, "onCancel" | "cancelLabel"> & {
  title: string;
  description: string;
};


export const SchemaFormDialog = ({title, description, ...props}: SchemaFormDialogProps) => {
  const { closeDialog } = useDialog();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <ScrollArea className="max-h-[500px] p-2 pr-4">
        <SchemaForm {...props} onCancel={() => closeDialog(DialogType.SCHEMA_FORM)} />
      </ScrollArea>
    </DialogContent>
  );
};
