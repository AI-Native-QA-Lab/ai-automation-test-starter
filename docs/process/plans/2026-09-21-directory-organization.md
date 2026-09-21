# 项目目录整理实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 在不改变运行时包边界、公共命令和根目录规范入口的前提下，降低项目导航噪音。

**架构：** 根目录继续保留项目契约和入口文件；过程计划统一放入 `docs/process/plans/`；新增一个英文文档导航页；清理 starter 模板中的生成缓存。

**技术栈：** Markdown、pnpm workspace、Vitest、Python/Pytest。

---

### 任务 1：定义并测试文档目录布局

**文件：**

- 修改：`tests/docs/documentation-structure.test.ts`
- 新增：`docs/README.md`
- 移动：`docs/superpowers/plans/*` 到 `docs/process/plans/`

- [ ] **步骤 1：先写失败的目录结构断言**

断言文档导航页和过程计划新路径存在，并断言旧的工具专用目录不存在。

- [ ] **步骤 2：运行文档测试并确认按预期失败**

运行：`pnpm exec vitest run tests/docs/documentation-structure.test.ts`

预期：由于导航页和新计划路径尚未创建，测试失败。

- [ ] **步骤 3：新增文档导航页并移动过程计划**

导航页链接根目录规范、分类英文文档、中文入口、过程记录和归档实施计划。

- [ ] **步骤 4：重新运行文档测试**

运行：`pnpm exec vitest run tests/docs/documentation-structure.test.ts`

预期：测试通过。

### 任务 2：同步仓库索引并清理生成噪音

**文件：**

- 修改：`README.md`
- 修改：`docs/governance/MANIFEST.md`
- 修改：`docs/process/2026-09-20-bootstrap-progress.zh-CN.md`
- 删除：`templates/pytest-api/.pytest_cache/`

- [ ] **步骤 1：更新导航引用**

将根 README 和 manifest 指向 `docs/README.md` 及新的过程计划路径；根目录契约文件保持原位置。

- [ ] **步骤 2：只删除确定的 pytest 生成缓存**

删除精确路径 `templates/pytest-api/.pytest_cache/`，不删除源码、测试或用户文件。

- [ ] **步骤 3：运行全仓库引用和空白检查**

运行：`rg -n "docs/superpowers" --glob '!node_modules/**' --glob '!tests/docs/**' --glob '!docs/process/plans/**' .` 和 `git diff --check`。

预期：产品文档不再引用旧的 `docs/superpowers` 路径，且没有空白错误。

### 任务 3：确认目录整理没有破坏运行时边界

**文件：**

- 不应修改运行时代码。

- [ ] **步骤 1：运行完整验证门禁**

运行 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm test:contract`、`pnpm test:e2e`、`pnpm test:docs`、`pnpm build` 和 starter Pytest smoke test。

- [ ] **步骤 2：检查最终工作区状态**

运行：`git status --short`。
