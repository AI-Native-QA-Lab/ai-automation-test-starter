import { chmod, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { commandExistsOnPath, doctorProject, initProject, runCli } from './index.js';

const fixtureRoots: string[] = [];

async function createRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'aits-cli-'));
  fixtureRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(fixtureRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('aits CLI filesystem commands', () => {
  it('initializes a starter without overwriting an existing README', async () => {
    const root = await createRoot();
    await writeFile(join(root, 'README.md'), '# keep me\n', 'utf8');

    const result = await initProject(root);

    expect(result.created).toContain('tests/test_health.py');
    expect(result.created).toContain('.gitignore');
    expect(result.skipped).toContain('README.md');
    await expect(readFile(join(root, 'README.md'), 'utf8')).resolves.toBe('# keep me\n');
    await expect(readFile(join(root, '.gitignore'), 'utf8')).resolves.toContain('.env');
  });

  it('resolves the bundled template independently of the caller working directory', async () => {
    const root = await createRoot();
    const callerRoot = await createRoot();
    const previousWorkingDirectory = process.cwd();

    process.chdir(callerRoot);
    try {
      const result = await initProject(root);
      expect(result.created).toContain('tests/test_health.py');
    } finally {
      process.chdir(previousWorkingDirectory);
    }
  });

  it('doctor reports missing Python and Pytest as actionable checks', async () => {
    const root = await createRoot();

    const result = await doctorProject(root, { commandExists: async () => false });

    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'python', status: 'missing' }),
      expect.objectContaining({ id: 'pytest', status: 'missing' })
    ]));
    expect(result.ready).toBe(false);
  });

  it('checks each required executable once and keeps the result consistent', async () => {
    const root = await createRoot();
    const calls: string[] = [];

    const result = await doctorProject(root, {
      commandExists: async (command) => {
        calls.push(command);
        return true;
      }
    });

    expect(calls).toEqual(['python3', 'pytest']);
    expect(result.checks.filter((check) => check.id !== 'project').every((check) => check.status === 'detected')).toBe(true);
  });

  it('returns a non-zero exit code when doctor finds an unready project', async () => {
    const root = await createRoot();
    const messages: string[] = [];

    await expect(runCli(['doctor', root], { write: (message) => messages.push(message) })).resolves.toBe(1);
    expect(messages.join('\n')).toContain('Not ready');
  });

  it('does not treat a non-executable PATH entry as an installed command', async () => {
    const binRoot = await createRoot();
    const commandPath = join(binRoot, 'pytest');
    await writeFile(commandPath, '#!/bin/sh\n', 'utf8');
    await chmod(commandPath, 0o644);

    await expect(commandExistsOnPath('pytest', binRoot)).resolves.toBe(false);
  });

  it('does not follow a broken symlink while copying a starter file', async () => {
    const root = await createRoot();
    const externalTarget = join(root, 'outside.txt');
    await symlink(externalTarget, join(root, '.gitignore'));

    const result = await initProject(root);

    expect(result.skipped).toContain('.gitignore');
    await expect(readFile(externalTarget, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
  });
});
