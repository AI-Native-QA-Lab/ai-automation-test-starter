# AGENTS.md

## Purpose

This file is the engineering contract for coding agents working in this
repository.

The repository is an **AI-native test automation learning and
engineering kit**. Changes must preserve beginner usability,
framework-native behavior, deterministic verification, and test quality.

## Mandatory Working Method

Use TDD for product behavior and contracts:

``` text
Understand
  ↓
Write/adjust failing test
  ↓
Implement minimum change
  ↓
Run focused tests
  ↓
Refactor
  ↓
Run broader validation
  ↓
Review documentation and contracts
```

Do not implement a large feature first and add tests afterward.

## Before Editing

1.  Read this file.
2.  Read `docs/product/PROJECT_CHARTER.md`.
3.  Read the relevant document under `docs/architecture/`.
4.  Inspect existing tests and analogous implementation.
5.  Identify the contract being changed.
6.  State assumptions when source information is incomplete.

## Repository Invariants

### A-01 Framework-native

Never replace native framework semantics with a project-specific testing
DSL.

Good:

``` bash
pytest
npx playwright test
k6 run
```

Avoid creating a universal runner abstraction merely for cosmetic
consistency.

### A-02 Beginner-first

A new concept must be teachable. Examples should expose the native
concept instead of hiding it.

### A-03 No fabricated test target

Never invent:

-   API endpoints;
-   request/response fields;
-   selectors;
-   credentials;
-   expected business behavior;
-   performance SLOs;
-   test results.

If target information is missing, mark it as an explicit assumption or
request evidence.

### A-04 No fabricated evidence

A model response cannot mark a test as passed.

Only trusted execution can create execution evidence.

### A-05 Meaningful assertions

Do not create tests whose only purpose is to execute code.

Reject or flag:

-   empty assertions;
-   assertions that always pass;
-   swallowed assertion errors;
-   broad exception handling used to force green tests;
-   assertions unrelated to the stated test objective.

### A-06 Avoid brittle shortcuts

Unless a framework-specific document explicitly allows it:

-   do not use arbitrary sleeps;
-   do not use unstable selectors when semantic selectors exist;
-   do not hard-code secrets;
-   do not couple tests to execution order;
-   do not duplicate reusable setup without reason.

### A-07 Model-agnostic core

Domain contracts, workflows, adapters, and quality rules must not import
a specific model vendor SDK.

Provider-specific code belongs behind provider interfaces.

### A-08 English canonical documentation

Canonical project documentation is English.

Chinese documentation is localized from the same contract and must not
introduce a different product behavior.

### A-09 Deterministic CI

CI must not require a paid or remote LLM to validate the core
repository.

Use fixtures, fake providers, snapshots, and deterministic integration
tests.

### A-10 Small reviewable changes

Prefer small vertical slices. Do not refactor unrelated modules while
implementing a feature.

## AI Workflow

For an implementation task:

``` text
Goal
 ↓
Relevant contract
 ↓
Existing implementation
 ↓
Test plan
 ↓
RED
 ↓
GREEN
 ↓
REFACTOR
 ↓
Quality checks
 ↓
Documentation impact
```

For a generated test task:

``` text
Understand target
 ↓
Find analogous example
 ↓
Identify test objective
 ↓
Design meaningful assertions
 ↓
Generate minimum test
 ↓
Run
 ↓
Observe actual failure/success
 ↓
Diagnose
 ↓
Repair
 ↓
Quality review
 ↓
Explain what the learner should understand
```

## Agent Loop Guardrails

The loop must have:

-   explicit objective;
-   maximum iterations;
-   observable stop conditions;
-   execution evidence;
-   failure classification;
-   no silent degradation of assertions;
-   no deletion of failing coverage merely to reach green.

Stop and report when:

-   required target information is missing;
-   the environment is unavailable;
-   authentication is unavailable;
-   failure indicates a product defect rather than test defect;
-   the iteration budget is exhausted;
-   a requested repair would violate a quality invariant.

## Required Tests by Change Type

### Core contract

-   unit tests;
-   schema/contract tests;
-   invalid-input tests.

### Framework adapter

-   adapter conformance tests;
-   fixture-based project detection;
-   command resolution;
-   generated-context tests.

### Skill/workflow

-   golden input/output fixtures;
-   negative/ambiguity cases;
-   cross-provider-independent contract checks where possible.

### CLI

-   argument parsing;
-   exit code;
-   filesystem fixture;
-   failure message;
-   no destructive overwrite.

### Quality gate

-   true positive;
-   true negative;
-   false-positive regression fixtures;
-   severity behavior;
-   explainable finding.

## Documentation Rule

When changing a public contract, update the corresponding documentation
in the same change.

Public contracts include:

-   mode behavior;
-   adapter schema;
-   skill schema;
-   quality rule;
-   CLI;
-   generated project layout;
-   supported framework/version policy.

## Commit/PR Review Checklist

Before declaring work complete:

-   [ ] focused tests pass;
-   [ ] full relevant suite passes;
-   [ ] lint/type checks pass;
-   [ ] no secret or credential was added;
-   [ ] no vendor dependency leaked into core;
-   [ ] no framework-native API was hidden;
-   [ ] no fabricated evidence was produced;
-   [ ] documentation is updated;
-   [ ] English/Chinese documentation impact is identified;
-   [ ] change remains understandable to a beginner.

## Definition of Done

A feature is not done because code was generated.

It is done when:

``` text
Contract
+
Implementation
+
Tests
+
Executable verification
+
Documentation
+
Quality review
```

are consistent.
