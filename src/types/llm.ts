export type LLMType =
  | 'TEXT_GENERATION'
  | 'EMBEDDING'
  | 'IMAGE_GENERATION'
  | 'AUDIO_TRANSCRIPTION'
  | 'VIDEO_GENERATION';

export interface LLM {
  id: string;
  name?: string | null;
  provider: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  maxLimits: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentLimits: any;
  createdAt: string;
  updatedAt: string;
}

