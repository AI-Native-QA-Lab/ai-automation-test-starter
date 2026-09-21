import { describe, expect, it } from 'vitest';
import { FakeProvider } from '@aits/ai-runtime';
import { runBuildWorkflow } from './index.js';

describe('bounded Build workflow', () => {
  it('keeps provider suggestions separate from trusted execution evidence', async () => {
    const result = await runBuildWorkflow({
      objective: 'run the local health test',
      target: 'local deterministic fixture',
      provider: new FakeProvider([{ text: 'run pytest', structured: { action: 'run' } }]),
      runNative: async (command) => ({ exitCode: command === 'pytest' ? 0 : 1, output: '1 passed' })
    });

    expect(result.evidence.some((item) => item.source === 'suggestion')).toBe(true);
    expect(result.evidence.some((item) => item.source === 'execution')).toBe(true);
    expect(result.evidence.find((item) => item.source === 'execution')?.command).toBe('pytest');
    expect(result.stopReason).toBe('verified');
    expect(result.summaries.at(-1)).toBe('native pytest passed');
  });

  it('classifies provider failures as environment unavailability', async () => {
    const result = await runBuildWorkflow({
      objective: 'run the local health test',
      target: 'local deterministic fixture',
      provider: {
        id: 'failing-provider',
        capabilities: () => ({
          structuredOutput: true,
          toolCalling: false,
          contextSize: 8_192,
          streaming: false,
          vision: false
        }),
        invoke: async () => {
          throw new Error('network unavailable');
        }
      },
      runNative: async () => ({ exitCode: 0, output: '1 passed' })
    });

    expect(result.stopReason).toBe('environment_unavailable');
  });

  it('requires review before applying and verifying generated changes', async () => {
    let changesApplied = 0;
    let nativeRuns = 0;
    const result = await runBuildWorkflow({
      objective: 'create the local health test',
      target: 'local deterministic fixture',
      provider: new FakeProvider([{ text: 'Generate the test', structured: { action: 'generate' } }]),
      applyChange: async () => {
        changesApplied += 1;
        return { applied: true, summary: 'change applied' };
      },
      runNative: async () => {
        nativeRuns += 1;
        return { exitCode: 0, output: '1 passed' };
      }
    });

    expect(result.stopReason).toBe('human_decision_required');
    expect(changesApplied).toBe(0);
    expect(nativeRuns).toBe(0);
  });

  it('does not claim verification when the native command fails repeatedly', async () => {
    const result = await runBuildWorkflow({
      objective: 'run the local health test',
      target: 'local deterministic fixture',
      maxIterations: 2,
      provider: new FakeProvider([{ text: 'retry', structured: { action: 'run' } }, { text: 'retry', structured: { action: 'run' } }]),
      runNative: async () => ({ exitCode: 1, output: 'assertion failed' })
    });

    expect(result.stopReason).toBe('max_iterations');
    expect(result.evidence.some((item) => item.source === 'execution' && item.status === 'passed')).toBe(false);
  });

  it('stops before provider or native execution when the API target is missing', async () => {
    const provider = new FakeProvider([{ text: 'run pytest', structured: { action: 'run' } }]);
    let nativeRuns = 0;

    const result = await runBuildWorkflow({
      objective: 'create an API test',
      provider,
      runNative: async () => {
        nativeRuns += 1;
        return { exitCode: 0, output: '1 passed' };
      }
    });

    expect(result.stopReason).toBe('required_information_missing');
    expect(result.evidence).toEqual([]);
    expect(provider.requests).toEqual([]);
    expect(nativeRuns).toBe(0);
  });

  it('applies generated changes only through an explicit callback and reviews the result', async () => {
    let appliedFile = '';
    const result = await runBuildWorkflow({
      objective: 'create the local health test',
      target: 'local deterministic fixture',
      provider: new FakeProvider([{
        text: 'Add a meaningful status assertion',
        structured: {
          action: 'generate',
          summary: 'Generate the first Pytest health test',
          file: 'tests/test_health.py',
          content: 'def test_health():\n    assert response["status"] == "ok"'
        }
      }]),
      applyChange: async (suggestion) => {
        appliedFile = suggestion.file ?? '';
        return { applied: true, summary: 'change applied to the fixture workspace' };
      },
      review: async ({ suggestion, nativeResult, target }) => {
        expect(suggestion.action).toBe('generate');
        expect(nativeResult.exitCode).toBe(0);
        expect(target).toBe('local deterministic fixture');
        return { passed: true, summary: 'static review accepted the generated change' };
      },
      runNative: async () => ({ exitCode: 0, output: '1 passed' })
    });

    expect(appliedFile).toBe('tests/test_health.py');
    expect(result.changes).toEqual([{ applied: true, summary: 'change applied to the fixture workspace' }]);
    expect(result.phases).toEqual(['plan', 'review']);
    expect(result.review).toEqual({ passed: true, summary: 'static review accepted the generated change' });
    expect(result.evidence.some((item) => item.source === 'static' && item.status === 'passed')).toBe(true);
  });

  it('does not verify an unapplied generated change', async () => {
    let nativeRuns = 0;
    const result = await runBuildWorkflow({
      objective: 'create the local health test',
      target: 'local deterministic fixture',
      provider: new FakeProvider([{
        text: 'Generate the test',
        structured: { action: 'generate', summary: 'Generate the first Pytest health test' }
      }]),
      runNative: async () => {
        nativeRuns += 1;
        return { exitCode: 0, output: '1 passed' };
      }
    });

    expect(result.stopReason).toBe('human_decision_required');
    expect(result.evidence.some((item) => item.source === 'execution')).toBe(false);
    expect(nativeRuns).toBe(0);
  });

  it('blocks a generated change that removes existing assertions before applying it', async () => {
    let changesApplied = 0;
    let nativeRuns = 0;
    const result = await runBuildWorkflow({
      objective: 'repair the local health test',
      target: 'local deterministic fixture',
      currentContent: 'def test_health():\n    assert response["status"] == "ok"\n',
      provider: new FakeProvider([{
        text: 'Remove the assertion',
        structured: {
          action: 'repair',
          summary: 'Repair the test',
          content: 'def test_health():\n    response = get_health()\n'
        }
      }]),
      applyChange: async () => {
        changesApplied += 1;
        return { applied: true, summary: 'change applied' };
      },
      review: async () => ({ passed: true, summary: 'review accepted' }),
      runNative: async () => {
        nativeRuns += 1;
        return { exitCode: 0, output: '1 passed' };
      }
    });

    expect(result.stopReason).toBe('human_decision_required');
    expect(result.summaries.at(-1)).toContain('assertion');
    expect(changesApplied).toBe(0);
    expect(nativeRuns).toBe(0);
  });

  it('uses a bounded repair attempt after a native failure', async () => {
    let nativeRuns = 0;
    const result = await runBuildWorkflow({
      objective: 'repair the local health test',
      target: 'local deterministic fixture',
      provider: new FakeProvider([
        { text: 'The assertion is incomplete', structured: { action: 'generate', summary: 'initial change' } },
        { text: 'Repair the assertion', structured: { action: 'repair', summary: 'repair change' } }
      ]),
      applyChange: async () => ({ applied: true, summary: 'change applied' }),
      runNative: async () => {
        nativeRuns += 1;
        return nativeRuns === 1
          ? { exitCode: 1, output: 'AssertionError: status' }
          : { exitCode: 0, output: '1 passed' };
      },
      review: async () => ({ passed: true, summary: 'repair review accepted' })
    });

    expect(result.stopReason).toBe('verified');
    expect(result.iterations).toBe(2);
    expect(result.phases).toEqual(['plan', 'repair', 'review']);
    expect(result.changes).toHaveLength(2);
  });

  it('stops for an explicitly reported product defect instead of repairing blindly', async () => {
    const result = await runBuildWorkflow({
      objective: 'run the local health test',
      target: 'local deterministic fixture',
      provider: new FakeProvider([{ text: 'run pytest', structured: { action: 'run' } }]),
      runNative: async () => ({ exitCode: 1, output: 'product defect: server returned an unexpected 500 response' })
    });

    expect(result.stopReason).toBe('human_decision_required');
    expect(result.iterations).toBe(1);
  });

  it('stops before another tool call when the tool budget is exhausted', async () => {
    let nativeRuns = 0;
    const result = await runBuildWorkflow({
      objective: 'run the local health test',
      target: 'local deterministic fixture',
      maxToolExecutions: 1,
      provider: new FakeProvider([{ text: 'run pytest', structured: { action: 'run' } }]),
      runNative: async () => {
        nativeRuns += 1;
        return { exitCode: 0, output: '1 passed' };
      }
    });

    expect(result.stopReason).toBe('human_decision_required');
    expect(result.toolExecutions).toBe(1);
    expect(nativeRuns).toBe(0);
  });

  it('redacts credential-like fields before storing provider evidence', async () => {
    const result = await runBuildWorkflow({
      objective: 'run the local health test',
      target: 'local deterministic fixture',
      provider: new FakeProvider([{
        text: 'run pytest',
        structured: { action: 'run', token: 'do-not-store-this-value' }
      }]),
      runNative: async () => ({ exitCode: 0, output: '1 passed' })
    });

    const suggestion = result.evidence.find((item) => item.source === 'suggestion');
    expect(suggestion?.output).toContain('[REDACTED]');
    expect(suggestion?.output).not.toContain('do-not-store-this-value');
  });
});
