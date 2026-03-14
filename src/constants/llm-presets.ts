import { LLMPreset } from "../types/llm";

export const LLM_PRESETS: LLMPreset[] = [
  {
    provider: "OPENAI",
    purpose: "COMPLETION",
    models: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
    fields: [
      {
        name: "apiKey",
        label: "API Key",
        type: "password",
        required: true,
        encrypted: true,
        placeholder: "sk-...",
        description: "Your OpenAI API key from the dashboard.",
      },
      {
        name: "organizationId",
        label: "Organization ID",
        type: "string",
        required: false,
        encrypted: false,
        placeholder: "org-...",
      },
      {
        name: "temperature",
        label: "Temperature",
        type: "number",
        required: false,
        encrypted: false,
        defaultValue: 0.7,
        description: "Sampling temperature (0-2).",
      },
    ],
  },
  {
    provider: "OPENAI",
    purpose: "EMBEDDING",
    models: ["text-embedding-3-small", "text-embedding-3-large", "text-embedding-ada-002"],
    fields: [
      {
        name: "apiKey",
        label: "API Key",
        type: "password",
        required: true,
        encrypted: true,
        placeholder: "sk-...",
      },
    ],
  },
  {
    provider: "ANTHROPIC",
    purpose: "COMPLETION",
    models: ["claude-3-5-sonnet", "claude-3-opus", "claude-3-haiku"],
    fields: [
      {
        name: "apiKey",
        label: "API Key",
        type: "password",
        required: true,
        encrypted: true,
        placeholder: "sk-ant-...",
      },
      {
        name: "maxTokens",
        label: "Max Tokens",
        type: "number",
        required: false,
        encrypted: false,
        defaultValue: 4096,
      },
    ],
  },
  {
    provider: "GOOGLE",
    purpose: "COMPLETION",
    models: ["gemini-1.5-pro", "gemini-1.5-flash"],
    fields: [
      {
        name: "apiKey",
        label: "API Key",
        type: "password",
        required: true,
        encrypted: true,
      },
      {
        name: "topP",
        label: "Top P",
        type: "number",
        required: false,
        encrypted: false,
        defaultValue: 0.95,
      },
    ],
  },
  {
    provider: "GOOGLE",
    purpose: "EMBEDDING",
    models: ["text-embedding-004"],
    fields: [
      {
        name: "apiKey",
        label: "API Key",
        type: "password",
        required: true,
        encrypted: true,
      },
    ],
  },
];
