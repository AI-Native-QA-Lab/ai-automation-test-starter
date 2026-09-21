import { describe, expect, it } from 'vitest';
import { classifyFailure } from './index.js';

describe('Debug workflow failure taxonomy', () => {
  it('classifies missing dependencies without treating them as product defects', () => {
    expect(classifyFailure({
      exitCode: 1,
      output: "ModuleNotFoundError: No module named 'requests'"
    })).toMatchObject({ category: 'dependency', confidence: 'high' });
  });

  it('keeps timeout failures separate from assertion failures', () => {
    expect(classifyFailure({
      exitCode: 1,
      output: 'native test runner timed out',
      timedOut: true
    })).toMatchObject({ category: 'flaky_timeout' });
  });

  it('does not invent a diagnosis for an unrecognized failure', () => {
    expect(classifyFailure({
      exitCode: 1,
      output: 'the remote system returned an unfamiliar diagnostic'
    })).toMatchObject({ category: 'unknown', confidence: 'low' });
  });

  it('only labels product behavior when the evidence states it explicitly', () => {
    expect(classifyFailure({
      exitCode: 1,
      output: 'product defect: server returned an unexpected 500 response'
    })).toMatchObject({ category: 'product_behavior', confidence: 'high' });
  });
});
