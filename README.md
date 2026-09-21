# AI Automation Test Starter

> English (canonical) · [简体中文](docs/zh-CN/README.md)

> **Status:** v0.1 deterministic MVP\
> **Positioning:** Beginner-first, AI-native test automation learning
> and engineering kit\
> **Default documentation language:** English\
> **Localized documentation:** Simplified Chinese (`docs/zh-CN/` in
> implementation)\
> **Development approach:** TDD\
> **Core experience:** `Learn → Build → Verify → Ship`

## 1. Project Summary

AI Automation Test Starter is a new source-available project with a
noncommercial license, designed for the AI era. It is **not** a migration
or refactor of the existing Automation-Test-Starter repositories.

The project helps beginners and QA engineers learn and build real test
automation with AI while keeping the underlying framework native:

-   Pytest remains Pytest.
-   Playwright remains Playwright.
-   k6 remains k6.
-   REST Assured remains REST Assured.

The project standardizes the **AI-assisted learning and engineering
experience**, not the test framework API.

## 2. Problem

Coding agents can already generate test code. That is no longer enough.

A beginner still needs help answering:

-   What should be tested?
-   Why is this assertion meaningful?
-   Which framework concept should be used?
-   Why did the test fail?
-   Is the generated test trustworthy?
-   Is the test maintainable?
-   How does the test move into CI/CD?
-   When should AI coach, assist, or execute autonomously?

The project therefore focuses on **learning, engineering quality,
verification, and progression**, rather than generic code generation.

## 3. Core Value Proposition

> Learn test automation by building real, verifiable, maintainable tests
> with AI.

The primary workflow is:

``` text
Requirement / API / UI / Performance Goal
                    ↓
                 Learn
                    ↓
                 Build
                    ↓
                 Verify
                    ↓
                  Ship
```

AI participates in each stage, but the level of autonomy depends on the
selected mode.

## 4. Modes

### Learn Mode

AI behaves as a coach.

-   explains framework concepts;
-   decomposes the task;
-   asks the learner to implement meaningful parts;
-   reviews the learner's changes;
-   explains failures;
-   explains why a test is or is not trustworthy.

### Build Mode

AI behaves as an engineering assistant.

-   analyzes the target;
-   creates or modifies tests;
-   reuses repository conventions;
-   runs tests;
-   diagnoses failures;
-   proposes fixes;
-   performs quality review.

### Agent Mode

AI executes an approved automation loop:

``` text
Plan
 ↓
Generate
 ↓
Run
 ↓
Observe
 ↓
Diagnose
 ↓
Fix
 ↓
Verify
 ↓
Review
```

Agent Mode is post-MVP and must preserve explicit safety and quality
gates.

## 5. MVP Scope

MVP supports one complete vertical slice:

**Pytest API Automation**

MVP proves:

1.  project bootstrap;
2.  AI repository context;
3.  Learn Mode;
4.  Build Mode;
5.  deterministic run/debug loop;
6.  quality review;
7.  CI generation/guidance;
8.  English-first + Chinese localized documentation;
9.  model-agnostic provider contract;
10. TDD-based implementation.

MVP intentionally does **not** attempt to support every testing
framework.

## 6. Planned Framework Evolution

``` text
MVP / v0.1   Pytest API
v0.2         k6 Performance
v0.3         Playwright UI
v0.5         Framework Adapter SDK
v0.7         Quality Gate / Auditor integration
v0.8         Multi-model / multi-harness hardening
v0.9         Agent Mode
v1.0         Stable contracts + three validated domains
post-v1.0    Additional adapters and ecosystem integrations
```

## 7. Repository Principles

1.  Beginner-first.
2.  Framework-native.
3.  AI-native, not AI-dependent.
4.  Model-agnostic.
5.  TDD by default.
6.  Quality before autonomy.
7.  Evidence before claims.
8.  No fabricated APIs, fields, results, or test evidence.
9.  Human-readable repository context.
10. English is canonical; Chinese is a maintained localization.
11. Common UX, native framework commands.
12. Prefer open contracts over vendor lock-in.

## 8. Proposed Repository

**Repository name:** `ai-automation-test-starter`

**Suggested GitHub description:**

> Beginner-first, AI-native test automation learning and engineering
> kit. Learn, build, verify, and ship reliable tests with
> framework-native workflows.

**Suggested topics:**

`ai-testing`, `test-automation`, `qa`, `agentic-testing`, `pytest`,
`playwright`, `k6`, `testing`, `ai-agent`, `testing-tools`,
`quality-engineering`

## 9. Documentation Map

-   `docs/README.md` --- documentation navigation index.
-   `docs/product/PROJECT_CHARTER.md` --- scope, users, goals and non-goals.
-   `AGENTS.md` --- coding-agent engineering contract.
-   `docs/architecture/ARCHITECTURE.md` --- system architecture.
-   `docs/product/MVP_PLAN.md` --- MVP backlog and acceptance criteria.
-   `docs/engineering/IMPLEMENTATION_PLAN.md` --- TDD implementation sequence.
-   `docs/product/ROADMAP.md` --- MVP through post-v1.0.
-   `docs/architecture/AI_RUNTIME.md` --- AI runtime and loop.
-   `docs/architecture/FRAMEWORK_ADAPTERS.md` --- adapter contract.
-   `docs/architecture/QUALITY_GATE.md` --- test-quality verification.
-   `docs/product/LEARNING_EXPERIENCE.md` --- Learn/Build/Agent UX.
-   `docs/engineering/TDD_STRATEGY.md` --- engineering test strategy.
-   `docs/i18n/DOCUMENTATION_POLICY.md` --- English/Chinese policy.
-   `docs/process/` --- Chinese implementation records and archived plans.
-   `docs/research/COMPETITIVE_LANDSCAPE.md` --- competitive
    conclusions.
-   `docs/governance/DECISIONS.md` --- frozen architecture decisions.

## 10. Success Definition

The project succeeds when a beginner can:

``` text
Clone / initialize
      ↓
Understand the target
      ↓
Create a meaningful test
      ↓
Run it
      ↓
Understand a failure
      ↓
Fix it
      ↓
Review its quality
      ↓
Put it in CI
```

without the project hiding the native testing framework from them.

## Language and implementation status

English is the canonical language for project contracts and API/CLI
documentation. The [Chinese documentation](docs/zh-CN/README.md) is a
maintained localization of the same behavior.

The current repository delivers the first local-first Pytest API slice:
contracts, a Pytest adapter, a non-destructive starter initializer,
deterministic fake-provider workflow primitives, an OpenAI-compatible
provider contract, Learn Mode coaching, bounded Build with explicit change
application and review hooks, deterministic Debug/Review/Ship workflows, and
static quality rules. k6, Playwright, and Agent Mode remain planned roadmap
work. Real-provider smoke is documented but is not required for deterministic
CI.

## License

This project is licensed under the
[PolyForm Noncommercial License 1.0.0](LICENSE).
