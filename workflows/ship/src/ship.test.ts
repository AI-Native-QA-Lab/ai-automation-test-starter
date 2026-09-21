import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validatePytestCiWorkflow } from './index.js';

describe('Ship workflow', () => {
  it('accepts the native Pytest starter workflow', () => {
    const workflow = readFileSync('templates/pytest-api/.github/workflows/test.yml', 'utf8');
    const result = validatePytestCiWorkflow(workflow);

    expect(result.passed).toBe(true);
    expect(result.checks.every((check) => check.passed)).toBe(true);
  });

  it('reports missing native execution and setup requirements', () => {
    const result = validatePytestCiWorkflow('name: Incomplete\njobs:\n  test:\n    runs-on: ubuntu-latest\n');

    expect(result.passed).toBe(false);
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'native-test-command', passed: false }),
      expect.objectContaining({ id: 'python-setup', passed: false })
    ]));
  });

  it('reports malformed YAML instead of accepting text that only matches the checks', () => {
    const result = validatePytestCiWorkflow('name: Broken\npermissions: [\njobs:\n  test:\n');

    expect(result.passed).toBe(false);
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'yaml-parse', passed: false })
    ]));
  });

  it('requires a supported Python version, pip cache, report upload, and secret placeholder', () => {
    const result = validatePytestCiWorkflow([
      'name: Incomplete',
      'permissions:',
      '  contents: read',
      'jobs:',
      '  test:',
      '    steps:',
      '      - uses: actions/checkout@v4',
      '      - uses: actions/setup-python@v5',
      '        with:',
      "          python-version: '2.7'",
      '      - run: python -m pip install -e .',
      '      - run: python -m pytest'
    ].join('\n'));

    expect(result.passed).toBe(false);
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'python-version', passed: false }),
      expect.objectContaining({ id: 'pip-cache', passed: false }),
      expect.objectContaining({ id: 'report-artifact', passed: false }),
      expect.objectContaining({ id: 'secret-placeholder', passed: false })
    ]));
  });

  it('does not accept split install text or an artifact unrelated to the JUnit report', () => {
    const workflow = readFileSync('templates/pytest-api/.github/workflows/test.yml', 'utf8')
      .replace('      - run: python -m pip install -e .', '      - run: python -m pip install --upgrade pip\n      - run: echo "-e ."')
      .replace('          path: pytest-results.xml', '          path: other-results.xml');

    const result = validatePytestCiWorkflow(workflow);

    expect(result.passed).toBe(false);
    expect(result.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'dependency-install', passed: false }),
      expect.objectContaining({ id: 'report-artifact', passed: false })
    ]));
  });
});
