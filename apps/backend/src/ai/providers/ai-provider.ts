/** JSON Schema the generated JSON has to match. */
export interface AiOutputFormat {
  name: string;
  schema: Record<string, unknown>;
  description?: string | undefined;
  strict?: boolean | undefined;
}

export interface AiJsonRequest {
  instructions: string;
  input: string;
  /** Without a format the provider only guarantees a JSON object. */
  outputFormat?: AiOutputFormat | undefined;
  maxOutputTokens?: number | undefined;
}

export interface AiTokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AiJsonResult {
  text: string;
  model: string;
  usage: AiTokenUsage;
  /** True when generation stopped early, e.g. at `maxOutputTokens`. */
  truncated: boolean;
}

/**
 * Vendor-neutral access to a large language model. Implementations live next
 * to this file; `AiModule` decides which one is injected.
 */
export abstract class AiProvider {
  abstract generateJson(request: AiJsonRequest): Promise<AiJsonResult>;
}
