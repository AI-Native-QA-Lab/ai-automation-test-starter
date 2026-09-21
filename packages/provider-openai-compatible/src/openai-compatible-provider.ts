import {
  ModelRequestSchema,
  type ModelProvider,
  type ModelRequest,
  type ModelResponse,
  type ProviderCapabilities
} from '@aits/contracts';

export type OpenAICompatibleProviderErrorCode =
  | 'context_limit'
  | 'timeout'
  | 'network'
  | 'http'
  | 'invalid_response';

export class OpenAICompatibleProviderError extends Error {
  readonly code: OpenAICompatibleProviderErrorCode;
  readonly status?: number;

  constructor(code: OpenAICompatibleProviderErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'OpenAICompatibleProviderError';
    this.code = code;
    if (status !== undefined) {
      this.status = status;
    }
  }
}

export interface OpenAICompatibleProviderOptions {
  endpoint: string;
  model: string;
  contextSize: number;
  apiKey?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  /** Optional character guard. Tokenization is provider/model-specific. */
  maxPromptCharacters?: number;
  fetchImpl?: typeof fetch;
  sleep?: (milliseconds: number) => Promise<void>;
}

const RETRYABLE_HTTP_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

function assertPositiveInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new TypeError(`${name} must be a positive integer`);
  }
}

function assertNonNegativeInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative integer`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export class OpenAICompatibleProvider implements ModelProvider {
  readonly id = 'openai-compatible';

  private readonly endpoint: string;
  private readonly model: string;
  private readonly contextSize: number;
  private readonly headers: Readonly<Record<string, string>>;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;
  private readonly maxPromptCharacters: number | undefined;
  private readonly fetchImpl: typeof fetch;
  private readonly sleep: (milliseconds: number) => Promise<void>;

  constructor(options: OpenAICompatibleProviderOptions) {
    let endpoint: URL;
    try {
      endpoint = new URL(options.endpoint);
    } catch {
      throw new TypeError('endpoint must be a valid URL');
    }
    if (!['http:', 'https:'].includes(endpoint.protocol)) {
      throw new TypeError('endpoint must use http or https');
    }
    if (!options.model.trim()) {
      throw new TypeError('model must not be empty');
    }

    assertPositiveInteger('contextSize', options.contextSize);

    const timeoutMs = options.timeoutMs ?? 30_000;
    const maxRetries = options.maxRetries ?? 2;
    const retryDelayMs = options.retryDelayMs ?? 250;
    if (!Number.isFinite(timeoutMs) || timeoutMs < 1) {
      throw new TypeError('timeoutMs must be a positive number');
    }
    assertNonNegativeInteger('maxRetries', maxRetries);
    if (!Number.isFinite(retryDelayMs) || retryDelayMs < 0) {
      throw new TypeError('retryDelayMs must be a non-negative number');
    }
    if (options.maxPromptCharacters !== undefined) {
      assertPositiveInteger('maxPromptCharacters', options.maxPromptCharacters);
    }

    const fetchImpl = options.fetchImpl ?? globalThis.fetch;
    if (typeof fetchImpl !== 'function') {
      throw new TypeError('fetch is not available; provide fetchImpl explicitly');
    }

    this.endpoint = endpoint.toString();
    this.model = options.model;
    this.contextSize = options.contextSize;
    this.headers = {
      accept: 'application/json',
      'content-type': 'application/json',
      ...options.headers,
      ...(options.apiKey ? { authorization: `Bearer ${options.apiKey}` } : {})
    };
    this.timeoutMs = timeoutMs;
    this.maxRetries = maxRetries;
    this.retryDelayMs = retryDelayMs;
    this.maxPromptCharacters = options.maxPromptCharacters;
    this.fetchImpl = fetchImpl;
    this.sleep = options.sleep ?? ((milliseconds) => new Promise<void>((resolve) => {
      setTimeout(resolve, milliseconds);
    }));
  }

  capabilities(): ProviderCapabilities {
    return {
      structuredOutput: true,
      toolCalling: false,
      contextSize: this.contextSize,
      streaming: false,
      vision: false
    };
  }

  async invoke(request: ModelRequest): Promise<ModelResponse> {
    const validRequest = ModelRequestSchema.parse(request);
    if (
      this.maxPromptCharacters !== undefined &&
      validRequest.prompt.length > this.maxPromptCharacters
    ) {
      throw new OpenAICompatibleProviderError(
        'context_limit',
        `prompt exceeds the configured ${this.maxPromptCharacters}-character guard`
      );
    }

    const body = {
      model: this.model,
      messages: [{ role: 'user', content: validRequest.prompt }],
      ...(validRequest.responseFormat === 'json'
        ? { response_format: { type: 'json_object' } }
        : {})
    };

    let retries = 0;
    while (true) {
      try {
        const response = await this.fetchWithTimeout(body);
        if (!response.ok) {
          throw new OpenAICompatibleProviderError(
            'http',
            `provider request failed with HTTP ${response.status}`,
            response.status
          );
        }

        const payload = await this.readJson(response);
        return this.parseResponse(payload, validRequest.responseFormat);
      } catch (error) {
        const normalized = this.normalizeError(error);
        if (!this.isRetryable(normalized) || retries >= this.maxRetries) {
          throw normalized;
        }

        retries += 1;
        await this.sleep(this.retryDelayMs * 2 ** (retries - 1));
      }
    }
  }

  private async fetchWithTimeout(body: unknown): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      return await this.fetchImpl(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });
    } catch (error) {
      if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
        throw new OpenAICompatibleProviderError('timeout', 'provider request timed out');
      }
      throw new OpenAICompatibleProviderError(
        'network',
        `provider request failed before receiving a response: ${errorMessage(error)}`
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private async readJson(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch (error) {
      throw new OpenAICompatibleProviderError(
        'invalid_response',
        `provider returned invalid JSON: ${errorMessage(error)}`
      );
    }
  }

  private parseResponse(payload: unknown, responseFormat: ModelRequest['responseFormat']): ModelResponse {
    if (!isRecord(payload) || !Array.isArray(payload.choices) || payload.choices.length === 0) {
      throw new OpenAICompatibleProviderError(
        'invalid_response',
        'provider response must contain at least one choice'
      );
    }

    const firstChoice = payload.choices[0];
    if (!isRecord(firstChoice) || !isRecord(firstChoice.message) || typeof firstChoice.message.content !== 'string') {
      throw new OpenAICompatibleProviderError(
        'invalid_response',
        'provider response choice must contain message.content as a string'
      );
    }

    const text = firstChoice.message.content;
    if (!text) {
      throw new OpenAICompatibleProviderError(
        'invalid_response',
        'provider response message.content must not be empty'
      );
    }

    if (responseFormat === 'text') {
      return { text };
    }

    try {
      return { text, structured: JSON.parse(text) as unknown };
    } catch (error) {
      throw new OpenAICompatibleProviderError(
        'invalid_response',
        `provider JSON output could not be parsed: ${errorMessage(error)}`
      );
    }
  }

  private normalizeError(error: unknown): OpenAICompatibleProviderError {
    if (error instanceof OpenAICompatibleProviderError) {
      return error;
    }
    return new OpenAICompatibleProviderError('network', `provider request failed: ${errorMessage(error)}`);
  }

  private isRetryable(error: OpenAICompatibleProviderError): boolean {
    return error.code === 'network' ||
      error.code === 'timeout' ||
      (error.code === 'http' && error.status !== undefined && RETRYABLE_HTTP_STATUSES.has(error.status));
  }
}
