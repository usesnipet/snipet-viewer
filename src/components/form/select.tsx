import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from '../ui/select';

type Props = {
  label?: string;
  name: string;
  fieldclassname?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
};

export const FormSelect = (props: Props) => {
  const form = useFormContext();
  const isLoading = form.formState.isSubmitting;

  return (
    <FormField
      control={form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className={props.fieldclassname}>
          {props.label && <FormLabel>{props.label}</FormLabel>}
          <FormControl>
            <Select disabled={isLoading} value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={props.placeholder ?? "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {
                  props.options.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.value}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
