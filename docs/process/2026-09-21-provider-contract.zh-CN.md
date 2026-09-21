# 2026-09-21 Provider Contract 迭代记录

## 当前目标

继续交付 v0.1 MVP 的 **Iteration 4：Provider Contract**，在不引入具体模型厂商 SDK 的前提下，补齐 OpenAI-compatible Provider 的最小可用实现。

## 已完成

- 新增 `OpenAICompatibleProvider`，实现 OpenAI Chat Completions 兼容请求格式。
- 支持 `text` 和 `json` 两种响应模式。
- 支持注入 `fetchImpl`，核心测试不依赖真实模型或远程服务。
- 支持请求超时、网络错误和临时 HTTP 错误的有限重试。
- 支持 `408`、`429` 和 `5xx` 临时状态码重试。
- 支持可配置的 Prompt 字符数上下文前置检查。
- 对 HTTP 错误、超时、网络失败和非法响应返回可分类错误。
- 保留模型建议与原生测试执行证据的边界。

## TDD 证据

先新增测试并确认 Provider 尚不存在时测试失败，再实现最小 Provider。新增测试覆盖：

- OpenAI-compatible 请求体和 JSON 结构化响应；
- 文本响应不伪造结构化数据；
- 临时 HTTP 错误重试；
- Prompt 上下文限制；
- 请求超时；
- 非法响应不重试；
- 不可重试 HTTP 错误及状态码保留。

当前 Provider 测试结果：`7 passed`。

## 当前边界

- 本次没有调用真实模型、真实 API Key 或外部 API，因此不宣称任何具体 Provider 的线上兼容性。
- `maxPromptCharacters` 是字符数保护阈值，不是 tokenizer；需要精确 token 限制时，调用方必须按目标模型配置。
- Learn Mode、Build、Debug/Review/Ship 的确定性实现已在后续 v0.1 完成记录中交付；本记录只覆盖 Provider Contract。

## 相关规范

- `docs/engineering/IMPLEMENTATION_PLAN.md` — Iteration 4 计划。
- `docs/architecture/AI_RUNTIME.md` — Provider 合同和运行时边界。
- `packages/provider-openai-compatible/src/openai-compatible-provider.ts` — 实现。
- `packages/provider-openai-compatible/src/openai-compatible-provider.test.ts` — 契约测试。
