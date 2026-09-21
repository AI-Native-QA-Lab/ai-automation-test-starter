import { describe, expect, it } from 'vitest';
import { FakeProvider, runBoundedLoop } from './index.js';

describe('provider-independent AI runtime', () => {
  it('returns the supplied structured response and records the request', async () => {
    const provider = new FakeProvider([{ text: 'plan', structured: { action: 'inspect' } }]);
    const response = await provider.invoke({ prompt: 'plan a test', responseFormat: 'json' });

    expect(response.structured).toEqual({ action: 'inspect' });
    expect(provider.requests).toHaveLength(1);
  });

  it('stops with missing-information evidence instead of retrying blindly', async () => {
    const result = await runBoundedLoop({
      objective: 'Create a GET API test',
      maxIterations: 2,
      step: async () => ({ kind: 'blocked', reason: 'required target missing' })
    });

    expect(result.stopReason).toBe('required_information_missing');
    expect(result.iterations).toBe(1);
  });

  it('stops when the iteration budget is exhausted', async () => {
    const result = await runBoundedLoop({
      objective: 'Keep observing',
      maxIterations: 2,
      step: async () => ({ kind: 'continue', summary: 'not done yet' })
    });

    expect(result.stopReason).toBe('max_iterations');
    expect(result.iterations).toBe(2);
  });
});
