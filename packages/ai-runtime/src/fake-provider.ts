import {
  ModelRequestSchema,
  ModelResponseSchema,
  type ModelProvider,
  type ModelRequest,
  type ModelResponse,
  type ProviderCapabilities
} from '@aits/contracts';

export class FakeProvider implements ModelProvider {
  readonly id = 'fake';
  readonly requests: ModelRequest[] = [];
  private readonly responses: ModelResponse[];

  constructor(responses: ModelResponse[]) {
    this.responses = responses.map((response) => ModelResponseSchema.parse(response));
  }

  capabilities(): ProviderCapabilities {
    return {
      structuredOutput: true,
      toolCalling: false,
      contextSize: 32_000,
      streaming: false,
      vision: false
    };
  }

  async invoke(request: ModelRequest): Promise<ModelResponse> {
    const validRequest = ModelRequestSchema.parse(request);
    this.requests.push(validRequest);
    return this.responses.shift() ?? { text: '' };
  }
}
