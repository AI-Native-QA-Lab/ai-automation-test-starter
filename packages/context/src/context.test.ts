import { describe, expect, it } from 'vitest';
import { buildRepositoryContext } from './index.js';

describe('repository context builder', () => {
  it('preserves an unknown API target instead of fabricating a URL', () => {
    const context = buildRepositoryContext({
      objective: 'create a GET test',
      files: ['README.md', 'tests/test_health.py']
    });

    expect(context.assumptions).toContain('API target is not provided');
    expect(context.text).not.toMatch(/https?:\/\//);
  });

  it('excludes irrelevant generated and dependency directories', () => {
    const context = buildRepositoryContext({
      objective: 'review the test',
      files: ['AGENTS.md', 'tests/test_health.py', 'node_modules/vite/index.js', 'dist/index.js']
    });

    expect(context.relevantFiles).toEqual(['AGENTS.md', 'tests/test_health.py']);
  });
});
