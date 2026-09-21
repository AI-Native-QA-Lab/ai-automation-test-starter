import { describe, expect, it } from 'vitest';
import type {
  ModelProvider,
  ModelRequest,
  ModelResponse,
  ProviderCapabilities
} from '@aits/contracts';
import { createLearnSession } from './index.js';

class StubProvider implements ModelProvider {
  readonly id = 'stub';
  readonly requests: ModelRequest[] = [];

  constructor(private readonly responses: ModelResponse[]) {}

  capabilities(): ProviderCapabilities {
    return {
      structuredOutput: true,
      toolCalling: false,
      contextSize: 8_192,
      streaming: false,
      vision: false
    };
  }

  async invoke(request: ModelRequest): Promise<ModelResponse> {
    this.requests.push(request);
    const response = this.responses.shift();
    if (!response) {
      throw new Error('stub response queue is empty');
    }
    return response;
  }
}

function response(structured: Record<string, unknown>): ModelResponse {
  return { text: structured.message as string, structured };
}

function explanationResponse(): ModelResponse {
  return response({
    stage: 'explanation',
    message: 'Start with one Pytest test function and one meaningful assertion.',
    concept: 'Pytest test function and assertion',
    nextAction: 'submit_step'
  });
}

describe('Learn Mode GET API scenario', () => {
  it('explains a native Pytest concept and asks for a small learner step', async () => {
    const provider = new StubProvider([explanationResponse()]);
    const session = createLearnSession({
      objective: 'Create a GET API test',
      target: 'local deterministic health fixture',
      provider
    });

    const turn = await session.start();

    expect(turn.stage).toBe('explanation');
    expect(turn.concept).toContain('Pytest');
    expect(turn.nextAction).toBe('submit_step');
    expect(session.history).toHaveLength(1);
    expect(provider.requests[0]?.responseFormat).toBe('json');
    expect(provider.requests[0]?.prompt).toContain('Do not provide a full solution');
  });

  it('reviews a learner step without replacing it with a full solution', async () => {
    const provider = new StubProvider([
      explanationResponse(),
      response({
        stage: 'review',
        message: 'Good start. Add an assertion about the response status.',
        concept: 'Meaningful status assertion',
        nextAction: 'request_hint'
      })
    ]);
    const session = createLearnSession({
      objective: 'Create a GET API test',
      target: 'local deterministic health fixture',
      provider
    });

    await session.start();
    const turn = await session.submitStep('I will call the health endpoint.');

    expect(turn.stage).toBe('review');
    expect(turn.fullSolution).toBeUndefined();
    expect(session.history).toHaveLength(2);
    expect(provider.requests[1]?.prompt).toContain('I will call the health endpoint.');
  });

  it('reviews an explicitly submitted code change', async () => {
    const provider = new StubProvider([
      explanationResponse(),
      response({
        stage: 'review',
        message: 'The change checks the status, but add a service assertion next.',
        concept: 'Meaningful response assertions',
        nextAction: 'submit_change'
      })
    ]);
    const session = createLearnSession({
      objective: 'Create a GET API test',
      target: 'local deterministic health fixture',
      provider
    });

    await session.start();
    const turn = await session.submitChange('assert response["status"] == "ok"');

    expect(turn.stage).toBe('review');
    expect(provider.requests[1]?.prompt).toContain('review_learner_change');
  });

  it('provides a hint without exposing a complete solution', async () => {
    const provider = new StubProvider([
      explanationResponse(),
      response({
        stage: 'hint',
        message: 'Look at the response status field before deciding what to assert.',
        concept: 'Response status assertion',
        nextAction: 'submit_change'
      })
    ]);
    const session = createLearnSession({
      objective: 'Create a GET API test',
      target: 'local deterministic health fixture',
      provider
    });

    await session.start();
    const turn = await session.requestHint();

    expect(turn.stage).toBe('hint');
    expect(turn.fullSolution).toBeUndefined();
    expect(turn.message).not.toContain('def test_');
  });

  it('accepts a complete solution only after an explicit request', async () => {
    const provider = new StubProvider([
      explanationResponse(),
      response({
        stage: 'solution',
        message: 'Here is the complete requested example.',
        concept: 'Complete Pytest API test',
        fullSolution: 'def test_health():\n    assert response.status_code == 200',
        nextAction: 'submit_change'
      })
    ]);
    const session = createLearnSession({
      objective: 'Create a GET API test',
      target: 'local deterministic health fixture',
      provider
    });

    await session.start();
    const turn = await session.requestFullSolution();

    expect(turn.stage).toBe('solution');
    expect(turn.fullSolution).toContain('def test_health');
    expect(provider.requests[1]?.prompt).toContain('explicitly requested');
  });

  it('rejects a provider that leaks a solution during a hint request', async () => {
    const provider = new StubProvider([
      explanationResponse(),
      response({
        stage: 'solution',
        message: 'Unexpected full answer',
        concept: 'Pytest',
        fullSolution: 'def test_health(): pass'
      })
    ]);
    const session = createLearnSession({
      objective: 'Create a GET API test',
      target: 'local deterministic health fixture',
      provider
    });

    await session.start();
    await expect(session.requestHint()).rejects.toMatchObject({ code: 'invalid_provider_response' });
    expect(session.history).toHaveLength(1);
  });

  it('stops before provider invocation when the API target is missing', async () => {
    const provider = new StubProvider([explanationResponse()]);
    const session = createLearnSession({
      objective: 'Create a GET API test',
      provider
    });

    await expect(session.start()).rejects.toMatchObject({ code: 'required_information_missing' });
    expect(provider.requests).toEqual([]);
  });
});
