import { describe, expect, it } from 'vitest';
import {
  OpenAICompatibleProvider,
  OpenAICompatibleProviderError
} from './index.js';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

function providerWith(fetchImpl: typeof fetch, options: Partial<ConstructorParameters<typeof OpenAICompatibleProvider>[0]> = {}) {
  return new OpenAICompatibleProvider({
    endpoint: 'https://provider.example/v1/chat/completions',
    model: 'test-model',
    contextSize: 8_192,
    fetchImpl,
    ...options
  });
}

describe('OpenAI-compatible provider', () => {
  it('sends a compatible chat request and parses structured JSON output', async () => {
    let receivedInput: RequestInfo | URL | undefined;
    let receivedInit: RequestInit | undefined;

    const provider = providerWith(async (input, init) => {
      receivedInput = input;
      receivedInit = init;
      return jsonResponse({
        choices: [{ message: { content: '{"action":"inspect"}' } }]
      });
    }, { apiKey: 'test-key' });

    const response = await provider.invoke({
      prompt: 'Plan a meaningful API test',
      responseFormat: 'json'
    });

    expect(response).toEqual({
      text: '{"action":"inspect"}',
      structured: { action: 'inspect' }
    });
    expect(receivedInput).toBe('https://provider.example/v1/chat/completions');
    expect(receivedInit?.method).toBe('POST');
    expect(receivedInit?.headers).toEqual({
      accept: 'application/json',
      authorization: 'Bearer test-key',
      'content-type': 'application/json'
    });
    expect(JSON.parse(String(receivedInit?.body))).toEqual({
      model: 'test-model',
      messages: [{ role: 'user', content: 'Plan a meaningful API test' }],
      response_format: { type: 'json_object' }
    });
  });

  it('returns text output without inventing structured data', async () => {
    const provider = providerWith(async () =>
      jsonResponse({ choices: [{ message: { content: 'Use pytest assertions' } }] })
    );

    await expect(provider.invoke({ prompt: 'Give a hint', responseFormat: 'text' })).resolves.toEqual({
      text: 'Use pytest assertions'
    });
  });

  it('retries transient HTTP failures before returning a successful response', async () => {
    let attempts = 0;
    const provider = providerWith(async () => {
      attempts += 1;
      return attempts < 3
        ? jsonResponse({ error: { message: 'temporary outage' } }, 503)
        : jsonResponse({ choices: [{ message: { content: 'ready' } }] });
    }, { maxRetries: 2, retryDelayMs: 0 });

    await expect(provider.invoke({ prompt: 'Try again', responseFormat: 'text' })).resolves.toEqual({
      text: 'ready'
    });
    expect(attempts).toBe(3);
  });

  it('fails fast when the prompt exceeds the configured context guard', async () => {
    let calls = 0;
    const provider = providerWith(async () => {
      calls += 1;
      return jsonResponse({ choices: [{ message: { content: 'unexpected' } }] });
    }, { maxPromptCharacters: 10 });

    await expect(provider.invoke({ prompt: 'This prompt is too long', responseFormat: 'text' }))
      .rejects.toMatchObject({ code: 'context_limit' });
    expect(calls).toBe(0);
  });

  it('maps an aborted request to a timeout error', async () => {
    const provider = providerWith(async (_input, init) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new Error('request aborted')));
    }), { timeoutMs: 5, maxRetries: 0 });

    await expect(provider.invoke({ prompt: 'Wait for response', responseFormat: 'text' }))
      .rejects.toMatchObject({ code: 'timeout' });
  });

  it('rejects malformed provider responses without retrying', async () => {
    let attempts = 0;
    const provider = providerWith(async () => {
      attempts += 1;
      return jsonResponse({ choices: [] });
    }, { maxRetries: 2 });

    const error = await provider.invoke({ prompt: 'Return JSON', responseFormat: 'json' }).catch((value: unknown) => value);

    expect(error).toBeInstanceOf(OpenAICompatibleProviderError);
    expect(error).toMatchObject({ code: 'invalid_response' });
    expect(attempts).toBe(1);
  });

  it('surfaces non-retryable provider failures with their HTTP status', async () => {
    const provider = providerWith(async () => jsonResponse({ error: { message: 'unauthorized' } }, 401));

    await expect(provider.invoke({ prompt: 'Call provider', responseFormat: 'text' }))
      .rejects.toMatchObject({ code: 'http', status: 401 });
  });
});
