# MVP 计划：v0.1 Pytest API 垂直切片

> [English（规范文档）](../product/MVP_PLAN.md) · 简体中文

## MVP 目标

证明项目可以帮助初学者从 API 测试目标出发，得到一个有意义、可执行、经过审查的 Pytest 测试，同时不隐藏 Pytest。

## MVP 用户故事

> 作为刚开始学习 Pytest API 自动化的 QA 工程师，我可以初始化 starter，请 AI 进行教练式或辅助式工作，创建有意义的 API 测试，运行测试，理解失败，审查测试质量，并配置 CI。

## 当前实现状态

当前实现优先完成本地、确定性的基础路径：

- 仓库契约和 TypeScript/pnpm 基础设施；
- `pnpm aits init` 与 `pnpm aits doctor`；
- Pytest API 项目检测和原生命令解析；
- 不依赖 AI 即可运行的 Pytest starter，包含 client seam、正向/负向示例、环境变量说明和 CI 报告 artifact；
- Skill/Workflow runtime schema，以及保证 core 不依赖 adapter/provider 的架构边界测试；
- 不绑定具体厂商 SDK 的 OpenAI-compatible provider 契约及其确定性测试；
- 能报告已观察 fixture、明确 unknown 和 evidence location 的 Pytest adapter context；
- GET API 场景的 Learn Mode 会话：解释 Pytest、接收学习者步骤、提供提示并保护完整方案；
- 带显式变更回调、生成/修复 review、工具预算和失败分类的有界 Build workflow；
- Debug、Review、Ship 确定性 workflow；
- fake provider、执行证据和有界循环契约；
- 初始质量规则与可解释 finding，覆盖 fake pass、secret、target metadata、status/body/business assertion gap、隔离/环境耦合，以及多行 swallowed exception；
- 对内联生成内容执行 assertion preservation 检查，并要求生成/修复内容经过宿主 review；
- 对 Python 版本、pip cache、JUnit artifact 和 secret placeholder 的 CI 结构校验；
- 英文规范文档和中文本地化入口。

v0.1 的确定性 Golden Path 已实现。workflow 目前以可嵌入的包 API 提供，尚未包装成完整交互式终端 UI；本地验证也不等于真实模型线上 smoke test。

## 原生命令

```bash
pnpm aits init
pnpm aits doctor
pytest
```

`pnpm aits` 是项目体验层命令，不是新的通用测试运行器；Learn/Build/Debug/Review/Ship 通过 workspace workflow 包提供。

## 不在 MVP 范围内

- 自主 Agent Mode；
- 浏览器自动化；
- 性能测试；
- REST Assured；
- 托管服务、账号系统和数据库；
- 自动 production 凭据、自动 merge 或 push。

## MVP 退出条件

退出条件必须同时包括契约测试、Pytest adapter conformance、无需 AI 的 starter 运行、真实调用临时 starter 的 fake-provider E2E、质量规则 fixture、CI 验证和架构不变量检查。模型输出不能替代这些证据。

验证研究当前状态为 **NOT RUN**。它是后续的产品验证活动，不属于上面的确定性 MVP 退出条件；不能从本地测试套件推导用户理解度、TTFMT 或真实业务目标结论。
