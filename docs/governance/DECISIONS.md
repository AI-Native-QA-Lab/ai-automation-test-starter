# Architecture and Product Decisions

## ADR-001 --- New Project

**Decision:** Build a new project rather than modify the existing
Automation-Test-Starter repositories.

**Reason:** The new project has different product assumptions, AI
runtime, contracts, and roadmap. Existing starters can remain stable
learning resources.

## ADR-002 --- Beginner-first

**Decision:** Beginner-first is the product position.

**Consequence:** Learning experience is a core feature, not
documentation added after engineering.

## ADR-003 --- Framework-native

**Decision:** Do not introduce a universal testing API.

**Consequence:** Users learn Pytest, Playwright, k6, etc. directly.

## ADR-004 --- Unified Experience, Not Unified Runner

**Decision:** Unify modes, workflows, quality gates, and adapter
contracts.

**Consequence:** Native framework commands remain first-class.

## ADR-005 --- Progressive Autonomy

**Decision:** Learn and Build precede Agent Mode.

**Consequence:** MVP does not require autonomous operation.

## ADR-006 --- TDD

**Decision:** Core development uses TDD and deterministic CI.

## ADR-007 --- Model-agnostic

**Decision:** Core does not depend on one model provider.

## ADR-008 --- English Canonical + Chinese Localization

**Decision:** English defines public contracts; Chinese is first-class
localized documentation.

## ADR-009 --- Three Pilot Domains Before v1.0

**Decision:** Validate API (Pytest), Performance (k6), and UI
(Playwright) before freezing the adapter SDK.

## ADR-010 --- Quality Gate Before Agent Mode

**Decision:** Autonomous loops are not promoted to stable behavior until
quality/evidence contracts exist.

## ADR-011 --- No Database Platform in MVP

**Decision:** No PostgreSQL/Redis/vector DB in MVP.

**Reason:** The project is a local starter/engineering kit, not a hosted
workbench.

## ADR-012 --- Integrate Mature Native Agents

**Decision:** Prefer integration with mature framework-native agent
features instead of rebuilding them.

## ADR-013 --- Ecosystem Projects Remain Separate

**Decision:** `awesome-qa-skills`, `ai-test-auditor`, and
`ai-native-qa-agents` remain separate projects and integrate through
explicit contracts.
