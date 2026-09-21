# Implementation Plan

## Development Strategy

Use vertical-slice TDD. Do not build all infrastructure before a
user-visible path exists.

## v0.1 Delivery Status

The deterministic Pytest API vertical slice now covers the planned local
workflow path through Iterations 0--10: contracts, CLI and adapter detection,
starter template, context, Provider contract, Learn Mode, bounded Build,
quality rules, Debug, Review, Ship, bilingual documentation, CI checks, and a
composed Golden Path test.

The remaining boundary is intentional: real-provider smoke/evaluation and
external API behavior are documented but are not treated as deterministic CI
evidence. The workflow packages expose host-integration APIs; an interactive
terminal UI is not part of this slice.

## Iteration 0 --- Freeze Contracts

### RED

Create failing tests for:

-   adapter schema;
-   provider contract;
-   mode transition;
-   evidence types;
-   quality finding;
-   bounded loop.

### GREEN

Implement minimum contracts and validation.

### Exit

No framework code yet; contracts are stable enough for one adapter.

## Iteration 1 --- CLI + Pytest Detection

Implement:

``` text
pnpm aits init
pnpm aits doctor
```

TDD cases:

-   empty directory;
-   existing Python project;
-   Pytest project;
-   missing Python;
-   missing Pytest;
-   unsupported layout;
-   non-destructive init.

Exit:

CLI can explain what it detected and what is missing.

## Iteration 2 --- Starter Template

Create a minimal production-oriented Pytest API starter.

TDD:

-   template renders;
-   dependencies install;
-   native `pytest` runs;
-   sample test passes;
-   environment variable is respected;
-   no secret is committed.

Exit:

AI is not needed to use the starter.

## Iteration 3 --- Context Builder

Inputs:

-   adapter metadata;
-   AGENTS rules;
-   task objective;
-   relevant examples;
-   repository structure.

TDD:

-   context contains required rules;
-   excludes irrelevant large files;
-   preserves explicit unknowns;
-   does not fabricate target information.

## Iteration 4 --- Provider Contract

Implement:

-   fake provider;
-   OpenAI-compatible provider.

TDD:

-   structured response;
-   timeout;
-   invalid response;
-   retry policy;
-   token/context limit handling;
-   provider failure.

Core must not import provider SDK.

## Iteration 5 --- Learn Mode

Start with one scenario: create a GET API test.

TDD behavior:

-   explains objective;
-   exposes native Pytest concept;
-   asks learner for a step;
-   provides hint;
-   reviews submitted change;
-   can provide full solution on explicit request.

## Iteration 6 --- Build Mode

Implement bounded loop:

``` text
Plan → Generate → Run → Observe → Diagnose → Fix → Verify
```

Controls:

-   max iterations;
-   max tool executions;
-   stop on missing target;
-   stop on environment failure;
-   stop on likely product defect;
-   preserve assertions.

## Iteration 7 --- Quality Gate

Implement static and semantic rules separately.

Static examples:

-   `except: pass`;
-   hard-coded secret patterns;
-   empty test;
-   unconditional `assert True`.

Semantic examples:

-   assertion does not prove declared objective;
-   excessive mocking;
-   missing negative-path coverage suggestion.

Semantic findings must be labeled as model-assisted when applicable.

## Iteration 8 --- Debug Workflow

Failure taxonomy:

-   environment;
-   dependency;
-   target unavailable;
-   authentication;
-   data;
-   assertion;
-   test implementation;
-   product behavior;
-   flaky/timeout;
-   unknown.

The workflow must not assume every failure is a test bug.

## Iteration 9 --- Ship Workflow

Generate or guide GitHub Actions.

Verify:

-   YAML parse;
-   native test command;
-   supported Python version;
-   cache;
-   report/artifact behavior;
-   secret placeholders.

## Iteration 10 --- MVP Hardening

-   docs;
-   examples;
-   Chinese localization;
-   security review;
-   architecture test;
-   fixture corpus;
-   golden E2E;
-   release checklist.

## Engineering Gates Per Iteration

Each iteration requires:

``` text
Contract
  +
Unit/Contract Test
  +
Implementation
  +
Integration Test
  +
Docs
  +
Review
```

## Recommended Technical Stack

### Core

-   TypeScript;
-   Node.js 20+;
-   pnpm workspace;
-   Turborepo optional, only if build graph justifies it;
-   Zod for runtime schemas;
-   Vitest for unit/contract tests.

### CLI

-   Node.js CLI;
-   a lightweight argument parser;
-   structured console output;
-   no heavy interactive UI in MVP.

### Test fixtures

-   fixture repositories under `tests/fixtures`;
-   Python/Pytest invoked as an external native runtime.

### AI

-   provider interface;
-   OpenAI-compatible first;
-   fake deterministic provider mandatory.

### CI

-   GitHub Actions.

## Do Not Add in MVP

-   PostgreSQL;
-   Redis;
-   Kubernetes;
-   vector DB;
-   web dashboard;
-   account system;
-   remote job scheduler;
-   complex plugin marketplace;
-   universal test runner.
