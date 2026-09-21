# AI Automation Test Starter v0.1 基础垂直切片实施计划

> **For agentic workers:** 本计划按 `superpowers:test-driven-development` 执行；每个行为先写失败测试，再实现最小代码，并在任务结束运行对应的完整测试命令。

**Goal:** 在空仓库中交付一个可安装、可验证、可直接运行原生 Pytest 的 AI Automation Test Starter v0.1 基础垂直切片。

**Architecture:** 使用 pnpm workspace 管理 TypeScript monorepo。核心契约、上下文、AI provider、质量规则和 Pytest adapter 分包；CLI 只编排这些边界，不替代 `pytest`。初始化生成的 starter 是独立的 Python/Pytest 项目，默认不依赖远程模型。

**Tech Stack:** Node.js 20+、TypeScript、pnpm、Zod、Vitest、ESLint、Python/Pytest、GitHub Actions。

**Spec:** `/Users/nao.deng/Downloads/ai-automation-test-starter-project-docs/`（纳入仓库后的英文规范文件：`docs/product/PROJECT_CHARTER.md`、`docs/architecture/ARCHITECTURE.md`、`docs/product/MVP_PLAN.md`、`docs/engineering/IMPLEMENTATION_PLAN.md` 及 `docs/**`）。

## Global Constraints

- `English is canonical; Chinese is a maintained localization.`
- `Native framework remains directly usable without AI.`
- `Core is provider-agnostic.`
- `CI can run without a remote model.`
- `AI claims never replace execution evidence.`
- `Agent loops are bounded.`
- 不虚构 API、字段、凭据、选择器、SLO 或测试结果。
- 公共项目文档英文优先；过程文档中文；中文翻译不得改变命令、契约语义、默认行为、质量阈值或支持状态。
- License 使用 PolyForm Noncommercial License 1.0.0，并保留完整许可证文本。

## Review Focus

- 空目录初始化必须创建最小可运行项目，且重复初始化不得覆盖用户文件；由 `apps/cli` 的 filesystem fixture 测试覆盖。
- 缺少 Python/Pytest 或未知项目布局必须给出可操作诊断而非声称支持；由 adapter/doctor 负向测试覆盖。
- fake provider、运行循环和质量报告不能把模型建议当成执行证据；由 AI runtime/quality contract 测试覆盖。
- Pytest starter 必须使用环境变量而非提交凭据，并且原生 `pytest` 可执行；由模板集成测试和 Python smoke test 覆盖。
- 中英文文档必须通过明确入口互相切换，且未完成能力不能被翻译文档伪装成已支持；由文档结构检查覆盖。

---

### Task 1: Monorepo foundation, project documentation, and license

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `eslint.config.mjs`
- Create: `.gitignore`
- Create: `LICENSE`
- Create: `.github/workflows/ci.yml`
- Copy as canonical English docs: `AGENTS.md`, `CONTRIBUTING.md`, `README.md`, `SECURITY.md`, `docs/architecture/**`, `docs/engineering/**`, `docs/governance/**`, `docs/i18n/**`, `docs/product/**`, `docs/research/**`
- Create: `docs/process/2026-09-20-bootstrap-progress.zh-CN.md`
- Test: `tests/docs/documentation-structure.test.ts`

**Interfaces:**
- Produces the workspace scripts used by every later task: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:contract`, `pnpm test:e2e`.

- [ ] **Step 1: Write the failing documentation structure test**

```ts
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('repository foundation', () => {
  it('exposes English canonical docs and a Chinese switch entry', () => {
    expect(existsSync(resolve('docs/product/PROJECT_CHARTER.md'))).toBe(true);
    expect(existsSync(resolve('docs/zh-CN/README.md'))).toBe(true);
    expect(readFileSync('README.md', 'utf8')).toContain('docs/zh-CN/README.md');
  });
});
```

- [ ] **Step 2: Run the focused test and confirm it fails because the files do not exist**

Run: `pnpm exec vitest run tests/docs/documentation-structure.test.ts`

Expected: FAIL with missing repository documentation.

- [ ] **Step 3: Add workspace configuration and import the supplied English specification**

Use Node 20-compatible scripts, keep package names under `@aits/*`, and add `typecheck` with `tsc --noEmit`. Copy the supplied documents without changing their public contract, then add English/Chinese links in the README.

- [ ] **Step 4: Add the exact PolyForm Noncommercial License 1.0.0 text**

Use the standard terms at `https://polyformproject.org/licenses/noncommercial/1.0.0` and do not add an invented copyright notice.

- [ ] **Step 5: Run the focused documentation test and the static checks**

Run: `pnpm exec vitest run tests/docs/documentation-structure.test.ts && pnpm lint && pnpm typecheck`

Expected: PASS, with no lint or type errors.

---

### Task 2: Core contracts and provider-independent runtime

**Files:**
- Create: `packages/contracts/package.json`
- Create: `packages/contracts/src/index.ts`
- Create: `packages/contracts/src/contracts.ts`
- Create: `packages/contracts/src/contracts.test.ts`
- Create: `packages/ai-runtime/package.json`
- Create: `packages/ai-runtime/src/index.ts`
- Create: `packages/ai-runtime/src/fake-provider.ts`
- Create: `packages/ai-runtime/src/bounded-loop.ts`
- Create: `packages/ai-runtime/src/ai-runtime.test.ts`

**Interfaces:**
- Produces `Mode`, `Evidence`, `QualityFinding`, `AdapterManifest`, `ModelProvider`, `ModelRequest`, `ModelResponse`, `LoopState`, and `runBoundedLoop` for later packages.

- [ ] **Step 1: Write failing contract tests**

```ts
it('rejects an evidence record that claims execution without a command', () => {
  expect(() => EvidenceSchema.parse({ source: 'execution', summary: 'passed' })).toThrow();
});

it('allows a bounded loop to stop on missing information', async () => {
  const result = await runBoundedLoop({
    objective: 'Create a GET API test',
    maxIterations: 2,
    step: async () => ({ kind: 'blocked', reason: 'required target missing' }),
  });
  expect(result.stopReason).toBe('required_information_missing');
});
```

- [ ] **Step 2: Run tests and verify the missing exports/schema failure**

Run: `pnpm exec vitest run packages/contracts/src/contracts.test.ts packages/ai-runtime/src/ai-runtime.test.ts`

Expected: FAIL because the contracts and loop do not yet exist.

- [ ] **Step 3: Implement minimal Zod contracts and bounded-loop transitions**

Keep the contracts free of framework and vendor imports. Require command/output fields for execution evidence; distinguish `suggestion`, `static`, `execution`, `ci`, and `human` evidence. The loop must stop on `done`, `blocked`, missing information, environment failure, or the iteration budget.

- [ ] **Step 4: Add deterministic fake provider and rerun contract tests**

The fake provider returns a supplied structured response and records requests; it must never claim that a native command ran. Run: `pnpm exec vitest run packages/contracts/src/contracts.test.ts packages/ai-runtime/src/ai-runtime.test.ts`

Expected: PASS.

---

### Task 3: Pytest API adapter and project detection

**Files:**
- Create: `adapters/pytest-api/package.json`
- Create: `adapters/pytest-api/src/index.ts`
- Create: `adapters/pytest-api/src/detect.ts`
- Create: `adapters/pytest-api/src/manifest.ts`
- Create: `adapters/pytest-api/src/pytest-api.test.ts`

**Interfaces:**
- Consumes the contracts package.
- Produces `pytestApiManifest`, `detectPytestProject(root)`, `resolvePytestCommand(path?)`, and `buildPytestContext(root)`.

- [ ] **Step 1: Write positive and negative fixture tests**

```ts
it('detects pyproject.toml with pytest configuration as Pytest API', async () => {
  const root = await createFixture({ 'pyproject.toml': '[tool.pytest.ini_options]\ntestpaths = ["tests"]\n' });
  expect(await detectPytestProject(root)).toMatchObject({ detected: true, adapterId: 'pytest-api' });
});

it('does not detect an unrelated JavaScript project', async () => {
  const root = await createFixture({ 'package.json': '{"name":"web-app"}' });
  expect(await detectPytestProject(root)).toMatchObject({ detected: false });
});
```

- [ ] **Step 2: Run the adapter test and observe the expected missing implementation failure**

Run: `pnpm exec vitest run adapters/pytest-api/src/pytest-api.test.ts`

Expected: FAIL because detection and manifest exports are absent.

- [ ] **Step 3: Implement manifest validation, detection, command resolution, and context metadata**

Recognize `pyproject.toml`, `pytest.ini`, `tox.ini`, or `setup.cfg` only when the file contains a Pytest signal; return explicit `unknown`/`missing` states rather than inventing support. Resolve native commands to `pytest` and `pytest <path>`.

- [ ] **Step 4: Run adapter tests and the contracts suite**

Run: `pnpm exec vitest run adapters/pytest-api/src/pytest-api.test.ts packages/contracts/src/contracts.test.ts`

Expected: PASS.

---

### Task 4: Native Pytest starter template and non-destructive CLI

**Files:**
- Create: `templates/pytest-api/pyproject.toml`
- Create: `templates/pytest-api/conftest.py`
- Create: `templates/pytest-api/tests/test_health.py`
- Create: `templates/pytest-api/.env.example`
- Create: `templates/pytest-api/.github/workflows/test.yml`
- Create: `apps/cli/package.json`
- Create: `apps/cli/src/index.ts`
- Create: `apps/cli/src/commands/init.ts`
- Create: `apps/cli/src/commands/doctor.ts`
- Create: `apps/cli/src/filesystem.ts`
- Create: `apps/cli/src/cli.test.ts`

**Interfaces:**
- Consumes the Pytest adapter and contracts.
- Produces `runCli(argv, io)`, `initProject(root)`, and `doctorProject(root)`; the CLI remains a thin orchestrator and leaves test execution to `pytest`.

- [ ] **Step 1: Write failing CLI tests for init/doctor behavior**

```ts
it('initializes an empty directory without overwriting an existing README', async () => {
  await writeFixture({ 'README.md': '# keep me\n' });
  const result = await initProject(root);
  expect(result.created).toContain('tests/test_health.py');
  expect(await readFile(join(root, 'README.md'), 'utf8')).toBe('# keep me\n');
});

it('doctor reports missing Python and Pytest as actionable checks', async () => {
  const result = await doctorProject(root, { commandExists: async () => false });
  expect(result.checks).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: 'python', status: 'missing' }),
    expect.objectContaining({ id: 'pytest', status: 'missing' }),
  ]));
});
```

- [ ] **Step 2: Run the CLI tests and verify the expected failure**

Run: `pnpm exec vitest run apps/cli/src/cli.test.ts`

Expected: FAIL because the CLI functions and template copy logic are absent.

- [ ] **Step 3: Implement the minimal non-destructive filesystem copier and doctor**

Copy only files that do not already exist, return created/skipped paths, never write credentials, and report `missing`, `detected`, or `unknown` checks. Parse only the supported commands `init` and `doctor` in this slice; unsupported commands exit with a concise usage error.

- [ ] **Step 4: Add native Python smoke verification**

Run: `python3 -m pytest templates/pytest-api/tests -q`

Expected: PASS without network access or a secret.

- [ ] **Step 5: Run the CLI and template test suites**

Run: `pnpm exec vitest run apps/cli/src/cli.test.ts adapters/pytest-api/src/pytest-api.test.ts && python3 -m pytest templates/pytest-api/tests -q`

Expected: PASS.

---

### Task 5: Context builder, quality gate, and deterministic Build slice

**Files:**
- Create: `packages/context/package.json`
- Create: `packages/context/src/index.ts`
- Create: `packages/context/src/context.test.ts`
- Create: `packages/quality/package.json`
- Create: `packages/quality/src/index.ts`
- Create: `packages/quality/src/rules.ts`
- Create: `packages/quality/src/quality.test.ts`
- Create: `workflows/build/src/index.ts`
- Create: `workflows/build/src/build.test.ts`
- Create: `tests/fixtures/quality/bad_test.py`
- Create: `tests/fixtures/quality/good_test.py`

**Interfaces:**
- `buildRepositoryContext(input)` preserves explicit unknowns and excludes irrelevant files.
- `reviewPythonTest(source, objective)` returns explainable deterministic findings.
- `runBuildWorkflow(input)` uses the fake provider, native command callback, bounded loop, and evidence records without weakening assertions.

- [ ] **Step 1: Write failing context, quality, and build tests**

```ts
it('preserves an unknown API target instead of fabricating a URL', () => {
  const context = buildRepositoryContext({ objective: 'create a GET test', target: undefined, files: ['README.md'] });
  expect(context.assumptions).toContain('API target is not provided');
  expect(context.text).not.toMatch(/https?:\/\//);
});

it('finds unconditional passes and swallowed exceptions', () => {
  const findings = reviewPythonTest(readFixture('bad_test.py'), 'validate voucher status');
  expect(findings.map((finding) => finding.ruleId)).toEqual(expect.arrayContaining(['always-pass', 'swallowed-exception']));
});

it('keeps execution evidence separate from provider suggestions', async () => {
  const result = await runBuildWorkflow({ provider: fakeProvider, runNative: async () => ({ exitCode: 0, output: '1 passed' }) });
  expect(result.evidence.some((item) => item.source === 'execution')).toBe(true);
  expect(result.evidence.find((item) => item.source === 'execution')?.command).toBe('pytest');
});
```

- [ ] **Step 2: Run the focused tests and confirm missing implementation failures**

Run: `pnpm exec vitest run packages/context/src/context.test.ts packages/quality/src/quality.test.ts workflows/build/src/build.test.ts`

Expected: FAIL because the context, rules, and workflow exports are absent.

- [ ] **Step 3: Implement minimal deterministic context and P0/P1 quality rules**

Implement rules for empty tests, `assert True`, swallowed exceptions, hard-coded secret patterns, disabled tests, missing assertions, arbitrary sleep, and excessive mocking. Each finding must include rule ID, severity, category, message, file/line evidence where available, remediation, and `source: static`.

- [ ] **Step 4: Implement the bounded Build workflow**

Use the provider for planning/generation suggestions only. Call the injected native runner for execution evidence. Stop when target data is missing, the command fails due to environment, the iteration limit is reached, or verification succeeds. Never delete/skip/weaken an assertion.

- [ ] **Step 5: Run all TypeScript tests and the native starter smoke test**

Run: `pnpm test && pnpm test:contract && python3 -m pytest templates/pytest-api/tests -q`

Expected: PASS.

---

### Task 6: English-first docs, Chinese switch/localization, CI, and final verification

**Files:**
- Create: `docs/zh-CN/README.md`
- Create: `docs/zh-CN/PROJECT_CHARTER.md`
- Create: `docs/zh-CN/MVP_PLAN.md`
- Create: `docs/zh-CN/DOCUMENTATION_POLICY.md`
- Modify: `README.md`
- Modify: `CONTRIBUTING.md`
- Modify: `SECURITY.md`
- Modify: `docs/i18n/DOCUMENTATION_POLICY.md`
- Create: `docs/process/2026-09-20-bootstrap-progress.zh-CN.md`
- Modify: `.github/workflows/ci.yml`
- Test: `tests/docs/documentation-structure.test.ts`

**Interfaces:**
- Docs expose the stable command set and accurately label unfinished modes/frameworks as planned.
- CI runs deterministic install, lint, typecheck, unit/contract tests, docs checks, and starter smoke without a remote model.

- [ ] **Step 1: Extend the docs test for language switching and scope labels**

```ts
it('links both languages and marks Agent Mode as planned', () => {
  const english = readFileSync('README.md', 'utf8');
  const chinese = readFileSync('docs/zh-CN/README.md', 'utf8');
  expect(english).toContain('docs/zh-CN/README.md');
  expect(chinese).toContain('README.md');
  expect(english).toContain('Agent Mode');
  expect(english).toMatch(/post-MVP|planned/i);
});
```

- [ ] **Step 2: Run the docs test and observe the missing localization failure**

Run: `pnpm exec vitest run tests/docs/documentation-structure.test.ts`

Expected: FAIL until the Chinese entries and synchronized links are present.

- [ ] **Step 3: Write the English-first / Chinese-localized entry points and Chinese process log**

Keep commands, statuses, contract names, and support boundaries identical across languages. The process log records actual decisions, tests, evidence, and remaining risks in Chinese.

- [ ] **Step 4: Add CI and run the full validation gate**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:contract && pnpm test:e2e && python3 -m pytest templates/pytest-api/tests -q && git diff --check && git status --short`

Expected: all commands exit 0; the final status lists only scoped project changes.

- [ ] **Step 5: Perform a final contract/documentation review**

Re-read the attached charter, architecture, MVP acceptance criteria, i18n policy, and security policy. Confirm every implemented claim has executable evidence and every unimplemented roadmap item remains explicitly labeled. Record any remaining limitation in the Chinese process document.
