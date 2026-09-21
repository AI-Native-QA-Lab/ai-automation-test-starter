import { describe, expect, it } from 'vitest';
import {
  AdapterManifestSchema,
  EvidenceSchema,
  QualityFindingSchema,
  SkillSchema,
  WorkflowSchema,
  canTransitionMode
} from './index.js';

describe('core contracts', () => {
  it('rejects execution evidence without a native command', () => {
    expect(() => EvidenceSchema.parse({ source: 'execution', summary: 'passed' })).toThrow();
  });

  it('accepts the Pytest API adapter manifest shape', () => {
    const manifest = AdapterManifestSchema.parse({
      id: 'pytest-api',
      displayName: 'Pytest API',
      domain: 'api',
      language: 'python',
      detection: { files: ['pyproject.toml', 'pytest.ini'] },
      commands: { test: 'pytest', testOne: 'pytest {path}' },
      context: { agents: 'AGENTS.md', skillNamespace: 'pytest-api' },
      evidence: { formats: ['junit', 'terminal'] },
      quality: { rules: ['meaningful-assertion', 'secrets-from-env'] }
    });

    expect(manifest.id).toBe('pytest-api');
  });

  it('rejects a quality finding without remediation or evidence source', () => {
    expect(() => QualityFindingSchema.parse({
      ruleId: 'always-pass',
      severity: 'high',
      category: 'test-quality',
      message: 'The test always passes.'
    })).toThrow();
  });

  it('allows Learn to move to Build but not directly to Agent', () => {
    expect(canTransitionMode('learn', 'build')).toBe(true);
    expect(canTransitionMode('learn', 'agent')).toBe(false);
  });

  it('validates skill and workflow contracts', () => {
    expect(SkillSchema.parse({
      id: 'pytest-api-coach',
      displayName: 'Pytest API Coach',
      description: 'Teaches one native Pytest API concept at a time.',
      inputs: ['objective', 'target'],
      outputs: ['learn-turn']
    })).toMatchObject({ id: 'pytest-api-coach' });

    expect(WorkflowSchema.parse({
      id: 'pytest-build',
      mode: 'build',
      steps: ['plan', 'run', 'review'],
      maxIterations: 3,
      evidenceSources: ['suggestion', 'execution', 'static']
    })).toMatchObject({ id: 'pytest-build' });
  });

  it('rejects incomplete skill and workflow contracts', () => {
    expect(() => SkillSchema.parse({ id: 'incomplete' })).toThrow();
    expect(() => WorkflowSchema.parse({
      id: 'incomplete',
      mode: 'build',
      steps: [],
      maxIterations: 0,
      evidenceSources: []
    })).toThrow();
  });
});
