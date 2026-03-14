import * as React from "react";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import { RJSFSchema, UiSchema, WidgetProps, FieldTemplateProps, ObjectFieldTemplateProps } from "@rjsf/utils";
import { Input, Select, Textarea } from "./form-elements";
import { Button } from "./button";
import { cn } from "../lib/utils";

// Custom Widgets to match our UI
const CustomBaseInput = (props: WidgetProps) => {
  const { value, readonly, disabled, onChange, onBlur, onFocus, options, schema, label, id, placeholder } = props;
  
  const type = schema.type === "integer" || schema.type === "number" ? "number" : "text";

  return (
    <Input
      id={id}
      label={label}
      value={value || ""}
      type={type}
      placeholder={placeholder || (schema.description as string)}
      disabled={disabled || readonly}
      onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
      onBlur={onBlur && ((e) => onBlur(id, e.target.value))}
      onFocus={onFocus && ((e) => onFocus(id, e.target.value))}
    />
  );
};

const CustomSelect = (props: WidgetProps) => {
  const { value, readonly, disabled, onChange, options, label, id } = props;
  const selectOptions = (options.enumOptions || []).map((opt: any) => ({
    label: opt.label,
    value: opt.value,
  }));

  return (
    <Select
      id={id}
      label={label}
      value={value || ""}
      options={selectOptions}
      disabled={disabled || readonly}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

const CustomFieldTemplate = (props: FieldTemplateProps) => {
  const { id, classNames, label, help, required, description, errors, children, schema } = props;
  
  // If it's an object, we don't want the extra wrapper
  if (schema.type === "object") {
    return <div className={classNames}>{children}</div>;
  }

  return (
    <div className={cn("space-y-1.5 mb-4", classNames)}>
      {children}
      {description && <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{description}</div>}
      {errors}
      {help}
    </div>
  );
};

const CustomObjectFieldTemplate = (props: ObjectFieldTemplateProps) => {
  return (
    <div className="space-y-6">
      {props.title && (
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{props.title}</h4>
          {props.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{props.description}</p>}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4">
        {props.properties.map((element) => (
          <div key={element.name} className="w-full">
            {element.content}
          </div>
        ))}
      </div>
    </div>
  );
};

interface SchemaFormProps {
  schema: RJSFSchema;
  uiSchema?: UiSchema;
  formData?: any;
  onSubmit: (data: any) => void;
  submitLabel?: string;
  loading?: boolean;
}

export function SchemaForm({ schema, uiSchema, formData, onSubmit, submitLabel = "Submit", loading }: SchemaFormProps) {
  const widgets = {
    TextWidget: CustomBaseInput,
    SelectWidget: CustomSelect,
  };

  const templates = {
    FieldTemplate: CustomFieldTemplate,
    ObjectFieldTemplate: CustomObjectFieldTemplate,
  };

  return (
    <div className="schema-form-container">
      <Form
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        validator={validator}
        widgets={widgets}
        templates={templates}
        onSubmit={({ formData }) => onSubmit(formData)}
        showErrorList={false}
      >
        <div className="mt-8 flex justify-end gap-3">
          <Button type="submit" loading={loading}>
            {submitLabel}
          </Button>
        </div>
      </Form>
    </div>
  );
}
