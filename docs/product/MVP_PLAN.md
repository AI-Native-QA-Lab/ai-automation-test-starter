# MVP Plan --- v0.1 Pytest API Vertical Slice

## MVP Objective

Prove that the project can help a beginner move from an API testing
objective to a meaningful, executable, reviewed Pytest test without
hiding Pytest.

## MVP User Story

> As a QA engineer new to Pytest API automation, I can initialize a
> starter, ask AI to coach or assist me, create a meaningful API test,
> run it, understand failures, review its quality, and configure CI.

## Target MVP Scope

### Included

-   repository contracts;
-   CLI bootstrap;
-   Pytest API adapter;
-   starter template;
-   Learn Mode;
-   Build Mode;
-   Debug workflow;
-   Review workflow;
-   Ship/CI workflow;
-   OpenAI-compatible provider;
-   deterministic fake provider;
-   bounded execution loop;
-   initial quality rules;
-   English canonical docs;
-   Chinese localization structure;
-   TDD and CI.

### Excluded

-   autonomous Agent Mode;
-   browser automation;
-   performance testing;
-   REST Assured;
-   hosted service;
-   account system;
-   database server;
-   vector database;
-   universal test DSL;
-   automatic production credentials;
-   automatic merge/push.

## Current Implementation Status

The current repository delivers the deterministic v0.1 MVP vertical slice:

-   repository contracts and deterministic CI;
-   CLI bootstrap and Pytest adapter detection;
-   a local, deterministic Pytest starter with a client-shaped seam, positive and
    negative examples, environment guidance, and a CI report artifact;
-   runtime-validated Skill and Workflow schemas plus architecture boundary
    tests that keep core code provider- and adapter-agnostic;
-   adapter context that reports observed fixtures, explicit unknowns, and
    available evidence locations;
-   a provider-agnostic OpenAI-compatible provider contract with deterministic
    timeout, retry, response-validation, and context-guard tests;
-   a GET API Learn Mode session that exposes Pytest concepts, reviews learner
    steps, and protects full solutions behind an explicit request;
-   a bounded Build workflow with explicit change-application and mandatory
    review for generated repairs, a tool-execution budget, and failure
    classification;
-   deterministic Debug, Review, and Ship workflow contracts;
-   fake-provider execution evidence and a bounded workflow primitive;
-   initial static quality rules for fake passes, secrets, target metadata,
    objective-to-status/body/business assertion gaps, isolation/coupling, and
    multi-line swallowed-exception detection;
-   inline Build assertion-preservation checks plus mandatory host review for
    generated or repaired content;
-   structural Ship checks for supported Python versions, pip caching, JUnit
    artifact upload, and secret placeholders;
-   English canonical documentation with a Chinese localization entry.

The v0.1 deterministic golden path is implemented. The workflow packages
remain host-integrated APIs rather than an interactive terminal UI, and no
real-provider smoke test is claimed as part of local deterministic validation.

## MVP Golden Path

``` text
Initialize project
      ↓
Detect Pytest API adapter
      ↓
Choose Learn or Build
      ↓
Provide API target/contract
      ↓
Analyze objective
      ↓
Create test design
      ↓
Generate/edit Pytest test
      ↓
pytest
      ↓
Observe result
      ↓
Diagnose if failed
      ↓
Repair within bounded loop
      ↓
Quality review
      ↓
Explain result
      ↓
Generate/validate CI workflow
```

## MVP Commands --- Current and Proposed

The CLI is for project experience, not framework replacement.

Current repository commands:

``` bash
pnpm aits init
pnpm aits doctor
```

Workflow package entry points:

``` bash
@aits/workflow-learn
@aits/workflow-build
@aits/workflow-debug
@aits/workflow-review
@aits/workflow-ship
```

Execution remains native:

``` bash
pytest
```

The current repository exposes the CLI through the `pnpm aits` script; a
standalone `aits` binary is not packaged in this slice.

## MVP Epics

### E0 --- Repository Foundation

Deliver:

-   monorepo;
-   TypeScript;
-   pnpm;
-   lint;
-   typecheck;
-   Vitest;
-   CI;
-   contribution rules;
-   architecture tests.

Acceptance:

-   clean clone can install and validate;
-   CI requires no real LLM.

### E1 --- Contracts

Deliver:

-   mode contract;
-   adapter schema;
-   skill schema;
-   workflow schema;
-   provider interface;
-   evidence model;
-   quality finding model.

Acceptance:

-   schemas have positive/negative tests;
-   contracts are documented.

### E2 --- Pytest API Adapter

Capabilities:

-   detect Python/Pytest project;
-   resolve native test command;
-   locate tests/config;
-   provide Pytest-specific context;
-   identify fixtures/conftest;
-   expose report/evidence locations.

Acceptance:

-   conformance suite passes.

### E3 --- Pytest API Starter Template

Includes:

-   `pyproject.toml`;
-   `tests/`;
-   `conftest.py`;
-   API client layer;
-   configuration;
-   environment-variable handling;
-   happy-path example;
-   negative example;
-   CI workflow;
-   beginner comments only where educationally useful.

Acceptance:

-   runs out of box against deterministic demo target/fixture;
-   no secret required.

### E4 --- Learn Mode

Behavior:

-   explains task;
-   asks learner to implement selected steps;
-   provides hints before full solution;
-   reviews changes;
-   explains Pytest concepts.

Acceptance:

-   learner can complete first meaningful test;
-   AI does not immediately overwrite the entire solution by default.

### E5 --- Build Mode

Behavior:

-   inspect;
-   design;
-   generate;
-   run;
-   diagnose;
-   repair;
-   review.

Acceptance:

-   loop is bounded;
-   generated or repaired changes require an explicit review callback;
-   tool executions have a separate positive budget;
-   likely product defects and unavailable environments stop with distinct
    classifications;
-   assertions cannot be weakened silently;
-   execution evidence is captured.

### E6 --- Quality Gate

Initial rules:

-   no empty test;
-   no swallowed assertion;
-   no always-pass assertion;
-   no hard-coded secret;
-   no fabricated target metadata;
-   meaningful status/body/business assertion guidance;
-   objective-to-status assertion-gap guidance;
-   test independence warning;
-   arbitrary sleep warning;
-   over-mocking warning.

Acceptance:

-   fixture corpus contains pass/fail examples;
-   findings contain reason and remediation.

### E7 --- CI Onboarding

Deliver:

-   GitHub Actions template;
-   dependency cache;
-   test command;
-   artifact/report handling;
-   secret guidance.

Acceptance:

-   generated starter passes CI in fixture repository.

### E8 --- Bilingual Documentation

Deliver:

-   English canonical docs;
-   Chinese localization policy;
-   localized quickstart for MVP.

Acceptance:

-   behavioral statements are traceable to canonical English docs.

## MVP Exit Criteria

MVP is complete when:

-   all contract tests pass;
-   Pytest adapter conformance passes;
-   starter can run without AI;
-   fake-provider E2E passes;
-   real-provider smoke test is documented but not required in CI;
-   Learn and Build golden paths work;
-   quality gate catches seeded fake-test patterns;
-   CI starter works;
-   no critical architecture invariant is violated.

## MVP Validation Study

Use 5--10 representative tasks:

-   GET happy path;
-   POST creation;
-   authentication failure;
-   validation error;
-   parameterized test;
-   fixture reuse;
-   environment configuration;
-   response schema check;
-   business-rule assertion;
-   CI failure diagnosis.

Measure TTFMT and user understanding.

Current status: **NOT RUN**. This is a follow-on product-validation activity,
not one of the deterministic MVP Exit Criteria above; no user-understanding,
TTFMT, or real-business-target result is inferred from the local test suite.
