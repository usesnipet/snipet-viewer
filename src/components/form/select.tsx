import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from '../ui/select';
import { Button } from '../ui/button';
import { Settings } from 'lucide-react';

type Props = {
  label?: string;
  name: string;
  fieldclassname?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  action?: {
    label?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    size?: 'icon-xs' | 'icon-sm' | 'icon-lg' | 'default' | 'xs' | 'sm' | 'lg';
    variant?: 'outline' | 'ghost' | 'default' | 'secondary' | 'destructive' | 'link';
    disabled?: boolean;
  }
};

export const FormSelect = (props: Props) => {
  const form = useFormContext();
  const isLoading = form.formState.isSubmitting;

  const ActionButton = () => {
    if (!props.action) return null;
    return (
      <Button
        type="button"
        disabled={props.action.disabled ?? false}
        size={props.action.size ?? 'default'}
        variant={props.action.variant ?? 'outline'}
        onClick={props.action.onClick}
      >
        {props.action.icon}
        {props.action.label}
      </Button>
    )

  }

  return (
    <FormField
      control={form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className={props.fieldclassname}>
          {props.label && <FormLabel>{props.label}</FormLabel>}
          <FormControl>
            <div className="flex gap-2 items-end">
              <Select disabled={isLoading} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={props.placeholder ?? "Select an option"} />
                </SelectTrigger>
                <SelectContent>
                  {
                    props.options.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              <ActionButton />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
