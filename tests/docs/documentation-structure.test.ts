import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('repository foundation', () => {
  it('exposes English canonical docs and a Chinese switch entry', () => {
    expect(existsSync(resolve('docs/product/PROJECT_CHARTER.md'))).toBe(true);
    expect(existsSync(resolve('docs/zh-CN/README.md'))).toBe(true);
    expect(readFileSync('README.md', 'utf8')).toContain('docs/zh-CN/README.md');
    expect(readFileSync('README.md', 'utf8')).toContain('docs/product/PROJECT_CHARTER.md');
  });

  it('keeps the supported slice and planned capabilities explicit in both language entry points', () => {
    const english = readFileSync('README.md', 'utf8');
    const chinese = readFileSync('docs/zh-CN/README.md', 'utf8');

    expect(english).toContain('Agent Mode');
    expect(english).toMatch(/planned roadmap\s+work/i);
    expect(chinese).toContain('Agent Mode');
    expect(chinese).toContain('路线图');
    expect(readFileSync('LICENSE', 'utf8')).toContain('PolyForm Noncommercial License 1.0.0');
  });

  it('keeps current implementation status aligned across English and Chinese MVP docs', () => {
    const english = readFileSync('docs/product/MVP_PLAN.md', 'utf8');
    const chinese = readFileSync('docs/zh-CN/MVP_PLAN.md', 'utf8');

    expect(english).toContain('## Current Implementation Status');
    expect(chinese).toContain('## 当前实现状态');
    expect(english).toContain('The v0.1 deterministic golden path is implemented.');
    expect(chinese).toContain('v0.1 的确定性 Golden Path 已实现。');
  });

  it('runs documentation checks in CI', () => {
    expect(readFileSync('.github/workflows/ci.yml', 'utf8')).toContain('pnpm test:docs');
  });

  it('installs the native Pytest dependency before the full test suite in CI', () => {
    const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
    const installPosition = workflow.indexOf('python3 -m pip install');
    const testMatch = /^\s*-\s+run:\s+pnpm test\s*$/m.exec(workflow);
    const testPosition = testMatch?.index ?? -1;

    expect(installPosition).toBeGreaterThanOrEqual(0);
    expect(testPosition).toBeGreaterThanOrEqual(0);
    expect(installPosition).toBeLessThan(testPosition);
  });

  it('keeps documentation navigation and process plans in stable locations', () => {
    expect(existsSync(resolve('docs/README.md'))).toBe(true);
    expect(existsSync(resolve('docs/process/plans/2026-09-20-mvp-bootstrap-implementation-plan.md'))).toBe(true);
    expect(existsSync(resolve('docs/superpowers'))).toBe(false);
  });

  it('keeps canonical project documents inside categorized documentation folders', () => {
    const expectedPaths = [
      'docs/architecture/ARCHITECTURE.md',
      'docs/engineering/IMPLEMENTATION_PLAN.md',
      'docs/governance/GITHUB_PROJECT_SETUP.md',
      'docs/governance/MANIFEST.md',
      'docs/product/MVP_PLAN.md',
      'docs/product/PROJECT_CHARTER.md',
      'docs/product/ROADMAP.md'
    ];

    for (const path of expectedPaths) {
      expect(existsSync(resolve(path))).toBe(true);
    }

    for (const path of [
      'ARCHITECTURE.md',
      'GITHUB_PROJECT_SETUP.md',
      'IMPLEMENTATION_PLAN.md',
      'MANIFEST.md',
      'MVP_PLAN.md',
      'PROJECT_CHARTER.md',
      'ROADMAP.md'
    ]) {
      expect(existsSync(resolve(path))).toBe(false);
    }
  });
});
