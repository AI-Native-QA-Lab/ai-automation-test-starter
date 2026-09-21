import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { buildPytestContext, detectPytestProject, pytestApiManifest, resolvePytestCommand } from './index.js';

const fixtureRoots: string[] = [];

async function createFixture(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'aits-pytest-adapter-'));
  fixtureRoots.push(root);
  for (const [relativePath, content] of Object.entries(files)) {
    const path = join(root, relativePath);
    await mkdir(join(path, '..'), { recursive: true });
    await writeFile(path, content, 'utf8');
  }
  return root;
}

afterEach(async () => {
  await Promise.all(fixtureRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('Pytest API adapter', () => {
  it('detects pyproject.toml with Pytest configuration', async () => {
    const root = await createFixture({
      'pyproject.toml': '[tool.pytest.ini_options]\ntestpaths = ["tests"]\n'
    });

    await expect(detectPytestProject(root)).resolves.toMatchObject({
      detected: true,
      adapterId: 'pytest-api',
      status: 'detected'
    });
  });

  it('does not detect an unrelated JavaScript project', async () => {
    const root = await createFixture({ 'package.json': '{"name":"web-app"}\n' });

    await expect(detectPytestProject(root)).resolves.toMatchObject({
      detected: false,
      adapterId: null,
      status: 'missing'
    });
  });

  it('resolves native Pytest commands without hiding the framework', () => {
    expect(resolvePytestCommand()).toBe('pytest');
    expect(resolvePytestCommand('tests/test_health.py')).toBe('pytest tests/test_health.py');
  });

  it('exposes observed fixtures and evidence locations in context', async () => {
    const root = await createFixture({
      'pytest.ini': '[pytest]\ntestpaths = tests\n',
      'AGENTS.md': 'Use native pytest commands.\n',
      'conftest.py': 'def pytest_configure(config):\n    pass\n',
      'pytest-results.xml': '<testsuite tests="1" failures="0" />\n',
      'tests/.gitkeep': ''
    });

    const context = await buildPytestContext(root);
    expect(context.adapterId).toBe('pytest-api');
    expect(context.relevantFiles).toEqual(expect.arrayContaining(['pytest.ini', 'AGENTS.md']));
    expect(context.fixtureFiles).toEqual(expect.arrayContaining(['conftest.py', 'tests/']));
    expect(context.evidenceLocations).toEqual(['pytest-results.xml', 'terminal']);
    expect(context.unknowns).toContain('API target is not provided');
  });

  it('does not assign the Pytest adapter to an unrelated project context', async () => {
    const root = await createFixture({ 'package.json': '{"name":"web-app"}\n' });

    const context = await buildPytestContext(root);

    expect(context.adapterId).toBeNull();
    expect(context.status).toBe('missing');
    expect(context.unknowns).toContain('No supported Pytest configuration was found');
    expect(context.evidenceLocations).toEqual([]);
  });

  it('publishes a manifest that passes the shared contract', () => {
    expect(pytestApiManifest).toMatchObject({
      id: 'pytest-api',
      commands: { test: 'pytest', testOne: 'pytest {path}' }
    });
    expect(pytestApiManifest.quality.rules).toEqual(expect.arrayContaining([
      'empty-test',
      'fabricated-target',
      'objective-business-assertion-gap',
      'execution-order-dependency'
    ]));
  });
});
