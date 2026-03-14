export type LLMProvider = "OPENAI" | "ANTHROPIC" | "GOOGLE" | "AZURE" | "LOCAL";
export type LLMPurpose = "COMPLETION" | "EMBEDDING";

export interface LLMFieldPreset {
  name: string;
  label: string;
  type: "string" | "number" | "boolean" | "password" | "select";
  required: boolean;
  encrypted: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultValue?: any;
  description?: string;
}

export interface LLMPreset {
  provider: LLMProvider;
  models: string[];
  fields: LLMFieldPreset[];
  purpose: LLMPurpose;
}

export interface LLMConfig {
  id: string;
  name: string;
  provider: LLMProvider;
  model: string;
  purpose: LLMPurpose;
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
