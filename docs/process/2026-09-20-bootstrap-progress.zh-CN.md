# 2026-09-20 项目搭建过程记录

## 当前目标

依据项目规格搭建 v0.1 Pytest API vertical slice：保留 Pytest 原生命令，先交付可离线验证的契约、CLI、adapter、starter、质量规则和双语文档基础。

## 已确认的约束

- 英文是项目公共契约的规范语言，中文是同步本地化。
- 过程记录使用中文；代码标识符、公共 API 和项目规范使用英文。
- AI 建议不能替代原生测试执行证据。
- 核心逻辑不能依赖具体模型厂商 SDK。
- 初始化不能覆盖用户已有文件，也不能生成凭据。
- Agent Mode、k6、Playwright、托管服务和自动 merge/push 属于后续路线，不在本次基础切片中宣称完成。
- 项目许可证为 PolyForm Noncommercial License 1.0.0。

## 执行记录

| 阶段 | 状态 | 证据 |
| --- | --- | --- |
| 读取附加规格 | 已完成 | `docs/product/PROJECT_CHARTER.md`、`docs/architecture/ARCHITECTURE.md`、`docs/product/MVP_PLAN.md`、`docs/engineering/IMPLEMENTATION_PLAN.md` 及 `docs/**` |
| 建立 monorepo 配置 | 已完成 | `package.json`、`pnpm-workspace.yaml`、`tsconfig.base.json`、`pnpm-lock.yaml` |
| 契约与测试 | 已完成 | 9 个 Vitest 文件、30 个测试；contracts/adapter/quality/build/e2e/docs 均有 fixture |
| Pytest starter 原生运行 | 已完成 | 隔离 venv 中 editable install + `python -m pytest`，结果 `1 passed` |
| 双语文档与 CI | 已完成 | `README.md` ↔ `docs/zh-CN/README.md`，`.github/workflows/ci.yml`，文档结构测试已接入 CI |

文档导航和实施计划统一位于 [`docs/README.md`](../README.md) 与
[`docs/process/plans/`](plans/)；根目录继续保留项目公共契约入口。

## 未决风险

- 尚未连接真实模型 provider；确定性 fake provider 用于 CI，真实 provider 仅作为后续 smoke/evaluation 范围。
- 尚未支持真实外部 API 目标；starter 使用本地确定性 fixture，不虚构外部服务行为。
- Learn Mode 的完整教练交互、真实 OpenAI-compatible provider、完整 Build 文件修改闭环、k6、Playwright 和 Agent Mode 仍按路线图推进。
- 当前工作区没有现有实现可复用，首个切片已同时建立包边界和测试基线。

## 本次验证命令

```text
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm test:contract
pnpm test:e2e
pnpm test:docs
pnpm build
PYTHONDONTWRITEBYTECODE=1 python3 -m pytest templates/pytest-api/tests -q
git diff --check
```

过程文档只记录本次真实执行得到的证据；模型建议、路线图规划和未来能力不被写成已验证结果。
