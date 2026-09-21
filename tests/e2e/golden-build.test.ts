import { mkdtemp as makeTempDirectory, rm as removeDirectory } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { initProject } from '@aits/cli';
import { FakeProvider } from '@aits/ai-runtime';
import { runBuildWorkflow } from '@aits/workflow-build';
import { runNativePytest } from './run-native-pytest.js';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => removeDirectory(root, { recursive: true, force: true })));
});

describe('MVP golden path', () => {
  it('initializes a Pytest starter and completes a fake-provider build loop', async () => {
    const root = await makeTempDirectory(join(tmpdir(), 'aits-golden-'));
    roots.push(root);
    await initProject(root);

    const result = await runBuildWorkflow({
      objective: 'run the starter health test',
      target: 'local deterministic fixture',
      provider: new FakeProvider([{ text: 'Use a meaningful status assertion', structured: { action: 'run' } }]),
      runNative: async () => runNativePytest(root)
    });

    expect(result.stopReason).toBe('verified');
    expect(result.evidence.some((item) => item.source === 'execution')).toBe(true);
  });
});
