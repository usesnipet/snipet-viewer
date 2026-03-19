import type { LLM } from "@/types";
import type { LLMType } from "@/types/llm";

export type PresetSchemaItem = {
  scope: string;
  targetId: string;
  // Backend can return provider-specific JSON schema shapes.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any;
  encryptedFields: string[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapLlmApiToUi(dto: any): LLM {
  return {
    id: dto.id,
    name: dto.name ?? null,
    provider: dto.provider,
    type: dto.modelType as LLMType,
    config: dto.config,
    maxLimits: dto.maxLimits,
    currentLimits: dto.currentLimits,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapLlmUiToApi(input: any) {
  const { type, ...rest } = input ?? {};
  return {
    ...rest,
    modelType: type,
  };
}
