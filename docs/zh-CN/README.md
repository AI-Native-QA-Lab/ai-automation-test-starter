# AI Automation Test Starter

> [English（规范文档）](../../README.md) · 简体中文

> **状态：** v0.1 确定性 MVP
> **定位：** 面向初学者、AI 原生的测试自动化学习与工程工具包
> **规范文档语言：** English
> **本地化文档：** 简体中文（本目录）
> **核心体验：** `Learn → Build → Verify → Ship`

## 项目简介

AI Automation Test Starter 帮助 QA 工程师和开发者在 AI 辅助下学习并构建真实、可验证、可维护的自动化测试。项目统一的是 AI 辅助学习与工程体验，而不是把 Pytest、Playwright 或 k6 包装成新的测试框架。

- Pytest 仍然是 Pytest。
- Playwright 仍然是 Playwright。
- k6 仍然是 k6。
- 原生测试命令始终可以脱离 AI 直接运行。

## 当前已交付范围

当前切片围绕 Pytest API 自动化，包含：

- TypeScript/pnpm monorepo 基础设施；
- provider-agnostic 的核心契约；
- Pytest API adapter 和项目检测；
- 非破坏性的 starter 初始化与环境诊断；
- 不依赖远程模型的确定性 fake provider；
- 不绑定具体厂商 SDK 的 OpenAI-compatible provider 契约；
- GET API 场景的 Learn Mode 教练式会话；
- 带显式变更回调和 review 钩子的有界 Build workflow；
- Debug、Review、Ship 确定性 workflow；
- 有界 Build workflow 原语与执行证据模型；
- 初始静态质量规则；
- 英文规范文档与中文本地化入口。

k6、Playwright、托管服务以及 Agent Mode 仍属于路线图工作，不在当前版本宣称已支持。

## 快速开始

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm aits doctor
pnpm aits init ./my-pytest-api
cd ./my-pytest-api
python3 -m pytest
```

`aits` 负责项目体验与诊断，不替代 Pytest。测试执行仍使用原生 `pytest` 命令。

## 文档导航

- [项目章程](PROJECT_CHARTER.md)
- [MVP 计划](MVP_PLAN.md)
- [英文架构文档](../architecture/ARCHITECTURE.md)
- [英文 CLI/贡献文档](../../CONTRIBUTING.md)
- [文档本地化策略](DOCUMENTATION_POLICY.md)
- [中文搭建过程记录](../process/2026-09-20-bootstrap-progress.zh-CN.md)

## 许可证

本项目使用 [PolyForm Noncommercial License 1.0.0](../../LICENSE)。
