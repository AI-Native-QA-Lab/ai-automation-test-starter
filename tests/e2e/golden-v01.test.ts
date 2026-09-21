import { readFile, writeFile, rm as removeDirectory } from 'node:fs/promises';
import { mkdtemp as makeTempDirectory } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { initProject } from '@aits/cli';
import { FakeProvider } from '@aits/ai-runtime';
import { createLearnSession } from '@aits/workflow-learn';
import { classifyFailure } from '@aits/workflow-debug';
import { reviewPythonSource } from '@aits/workflow-review';
import { validatePytestCiWorkflow } from '@aits/workflow-ship';
import { runBuildWorkflow } from '@aits/workflow-build';
import { runNativePytest } from './run-native-pytest.js';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => removeDirectory(root, { recursive: true, force: true })));
});

describe('v0.1 Pytest API golden path', () => {
  it('moves from learning to a reviewed, CI-ready native test', async () => {
    const root = await makeTempDirectory(join(tmpdir(), 'aits-v01-'));
    roots.push(root);
    await initProject(root);
    const target = 'local deterministic health fixture';

    const learnSession = createLearnSession({
      objective: 'Create a GET API health test',
      target,
      provider: new FakeProvider([{
        text: 'Start with a test function and one meaningful assertion.',
        structured: {
          stage: 'explanation',
          message: 'Start with a test function and one meaningful assertion.',
          concept: 'Pytest test function and assertion',
          nextAction: 'submit_step'
        }
      }])
    });
    const learningTurn = await learnSession.start();
    expect(learningTurn.nextAction).toBe('submit_step');

    const buildResult = await runBuildWorkflow({
      objective: 'Create a GET API health test',
      target,
      provider: new FakeProvider([{
        text: 'Generate a meaningful status assertion.',
        structured: {
          action: 'generate',
          summary: 'Generate the local health test',
          file: 'tests/test_health.py',
          content: [
            'from demo_api import health_response',
            '',
            'def test_health_response_proves_service_is_ready():',
            '    response = health_response()',
            '    assert response["status"] == "ok"'
          ].join('\n')
        }
      }]),
      applyChange: async (suggestion) => {
        await writeFile(join(root, suggestion.file ?? 'tests/test_health.py'), suggestion.content ?? '', 'utf8');
        return { applied: true, summary: 'generated test written to the temporary starter' };
      },
      runNative: async () => runNativePytest(root),
      review: async ({ suggestion, nativeResult }) => {
        const source = await readFile(join(root, suggestion.file ?? 'tests/test_health.py'), 'utf8');
        const review = reviewPythonSource({
          source,
          objective: 'Create a GET API health test',
          target,
          ...(suggestion.file ? { file: suggestion.file } : {})
        });
        return {
          passed: nativeResult.exitCode === 0 && review.passed,
          summary: review.summary
        };
      }
    });

    expect(buildResult.stopReason).toBe('verified');
    expect(buildResult.evidence.some((item) => item.source === 'execution' && item.status === 'passed')).toBe(true);
    expect(buildResult.review?.passed).toBe(true);

    expect(classifyFailure({ exitCode: 1, output: 'AssertionError: status' }).category).toBe('assertion');

    const ciWorkflow = await readFile(join(root, '.github/workflows/test.yml'), 'utf8');
    expect(validatePytestCiWorkflow(ciWorkflow).passed).toBe(true);

    const ciStyleRun = await runNativePytest(root, ['--junitxml=pytest-results.xml']);
    expect(ciStyleRun.exitCode).toBe(0);
    expect(await readFile(join(root, 'pytest-results.xml'), 'utf8')).toContain('<testsuite');
  });
});
