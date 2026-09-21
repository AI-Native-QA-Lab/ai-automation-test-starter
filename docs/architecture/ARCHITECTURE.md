# Architecture

## 1. Architecture Goal

Provide one consistent AI-assisted learning and engineering experience
across multiple native test frameworks without turning those frameworks
into a proprietary abstraction.

## 2. Logical Architecture

``` text
User
 │
 ├──────────────┬────────────────┐
 ▼              ▼                ▼
Learn Mode   Build Mode       Agent Mode
 │              │                │
 └──────────────┴────────┬───────┘
                         ▼
                 Experience Layer
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
         Workflows     Skills     Context
             │           │           │
             └───────────┼───────────┘
                         ▼
                    AI Runtime
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      Provider       Tool Runtime   Loop Controller
          │                              │
          └──────────────┬───────────────┘
                         ▼
                  Framework Adapter
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       Pytest            k6          Playwright
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                   Native Framework
                         │
                         ▼
                 Execution Evidence
                         │
                         ▼
                    Quality Gate
                         │
                         ▼
                       CI/CD
```

## 3. Main Components

### Experience Layer

Defines mode behavior and user journey.

It does not implement framework execution.

### Context Builder

Builds AI context from:

-   project metadata;
-   framework adapter;
-   repository conventions;
-   examples;
-   active skill;
-   task objective;
-   previous verified observations.

### Runtime Contracts

The shared contracts package validates the public shapes used by the runtime:

-   `SkillSchema` defines a named skill, its required inputs, and its outputs;
-   `WorkflowSchema` defines the mode, ordered steps, iteration bound, and
    allowed evidence sources;
-   `EvidenceSchema` distinguishes provider suggestions from trusted native
    execution evidence.

These schemas are provider- and framework-neutral. Adapter-specific context
and provider integrations stay at the edges of the architecture.

### Skill Runtime

Loads common QA skills and framework-specific skills.

### Workflow Runtime

Coordinates multi-step activities such as:

-   first test;
-   requirement-to-test;
-   debug;
-   review;
-   CI onboarding.

### Model Provider

Normalizes model invocation without normalizing model capabilities away.

Initial contract should support:

-   OpenAI-compatible providers;
-   fake/mock provider for CI.

Later providers can add Anthropic/Gemini/local models.

### Loop Controller

Controls bounded agent execution:

``` text
Plan → Act → Observe → Evaluate → Continue/Stop
```

### Framework Adapter

Supplies framework metadata and capabilities, not a replacement
framework.

### Quality Gate

Checks whether a test is meaningful, executable, maintainable, and
consistent with declared intent.

## 4. Proposed Repository Structure

``` text
ai-automation-test-starter/
├── README.md
├── AGENTS.md
├── CONTRIBUTING.md
├── LICENSE
├── SECURITY.md
├── package.json
├── pnpm-workspace.yaml
├── docs/
│   ├── architecture/ARCHITECTURE.md
│   ├── engineering/IMPLEMENTATION_PLAN.md
│   ├── governance/GITHUB_PROJECT_SETUP.md
│   ├── product/MVP_PLAN.md
│   ├── product/PROJECT_CHARTER.md
│   └── product/ROADMAP.md
│
├── apps/
│   └── cli/
│
├── packages/
│   ├── core/
│   ├── contracts/
│   ├── context/
│   ├── ai-runtime/
│   ├── provider-openai-compatible/
│   ├── skill-runtime/
│   ├── workflow-runtime/
│   ├── quality/
│   ├── adapter-sdk/
│   └── shared/
│
├── adapters/
│   ├── pytest-api/
│   ├── k6/
│   └── playwright/
│
├── skills/
│   ├── common/
│   │   ├── test-design/
│   │   ├── test-review/
│   │   ├── failure-analysis/
│   │   └── ci-integration/
│   └── frameworks/
│       ├── pytest-api/
│       ├── k6/
│       └── playwright/
│
├── workflows/
│   ├── learn/
│   ├── build/
│   ├── debug/
│   ├── review/
│   └── ship/
│
├── templates/
│   ├── pytest-api/
│   ├── k6/
│   └── playwright/
│
├── examples/
│   ├── pytest-api/
│   ├── k6/
│   └── playwright/
│
├── tests/
│   ├── fixtures/
│   ├── contract/
│   └── e2e/
│
└── docs/
```

## 5. Architectural Boundaries

### Core must not depend on

-   Pytest;
-   Playwright;
-   k6;
-   a specific model provider;
-   GitHub;
-   Jira;
-   a hosted backend.

### Adapter may depend on framework knowledge

An adapter can know:

-   project files;
-   native command;
-   config;
-   test discovery;
-   report format;
-   framework-specific conventions.

### Skills must not mutate blindly

A skill may propose actions. Mutation is performed through explicit
workflow/tool contracts.

## 6. State

MVP should remain local-first and lightweight.

State categories:

-   project files --- source of truth for generated starter;
-   session state --- local runtime;
-   execution evidence --- native framework output;
-   AI trace --- optional local diagnostic/audit data.

No PostgreSQL is required for MVP or v1.0.

## 7. Security

-   secrets from environment or OS secret store;
-   never place credentials in generated tests;
-   redact secrets from model context when possible;
-   treat external repository content as untrusted input;
-   tool execution must use allowlisted operations in Agent Mode.

## 8. Architecture Invariants

-   AR-01: Native framework remains directly usable without AI.
-   AR-02: Core is provider-agnostic.
-   AR-03: CI can run without a remote model.
-   AR-04: AI claims never replace execution evidence.
-   AR-05: Agent loops are bounded.
-   AR-06: Quality rules are explainable.
-   AR-07: Framework adapters satisfy a common conformance contract.
-   AR-08: English documentation defines canonical behavior.
-   AR-09: Learn Mode exposes concepts rather than hiding them.
-   AR-10: Adding an adapter does not require changing core domain
    logic.
-   AR-11: Generated or repaired changes require explicit host review before
    native verification.
-   AR-12: A bounded workflow has an iteration budget and an independent tool
    execution budget.
