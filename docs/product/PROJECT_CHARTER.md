# Project Charter

## Mission

Make modern test automation easier to learn and safer to build with AI.

## Target Users

### Primary

-   QA engineers starting automation;
-   manual testers transitioning to automation;
-   junior automation engineers;
-   developers learning a testing framework.

### Secondary

-   experienced QA engineers bootstrapping a new framework;
-   teams standardizing AI-assisted testing;
-   educators and mentors teaching automation.

## Jobs to Be Done

The project should help a user:

1.  choose an appropriate testing path;
2.  understand the framework's native concepts;
3.  build the first meaningful automated test;
4.  diagnose and fix failures;
5.  assess whether AI-generated tests are trustworthy;
6.  progress from coaching to assisted engineering;
7.  integrate the result into CI/CD.

## Product Principles

### Beginner-first, not beginner-only

The onboarding must be accessible, while generated projects and
practices must remain production-oriented.

### Framework-native

Do not invent a universal assertion, runner, page-object, HTTP-client,
or load-model API.

### Quality-gated AI

AI output is a proposal until it is validated by repository rules,
executable checks, and quality review.

### Progressive autonomy

Autonomy is earned:

``` text
Explain → Coach → Assist → Build → Agent
```

### Evidence over confidence

The system must distinguish:

-   model suggestion;
-   static validation;
-   executable test result;
-   CI result;
-   human approval.

## Non-Goals

The project is not:

-   a replacement for Pytest, Playwright, k6, REST Assured, or other
    frameworks;
-   a universal QA runtime;
-   a hosted test-management system;
-   a generic autonomous browser agent;
-   a no-code testing platform;
-   a clone of Playwright Planner/Generator/Healer;
-   a wrapper that hides native framework commands;
-   a promise that generated tests are correct without execution and
    review.

## Product Boundary

The project owns:

-   starter templates;
-   AI context and contracts;
-   learning workflows;
-   common QA skills;
-   framework-specific skills;
-   adapter metadata;
-   quality gates;
-   onboarding;
-   verification workflow;
-   CI onboarding.

The underlying framework owns:

-   execution engine;
-   assertions;
-   browser/API/load runtime;
-   native configuration;
-   reports where applicable.

## North-star Metric

**Time to First Meaningful Test (TTFMT)**

A meaningful test:

-   executes against a real or explicitly declared test target;
-   contains a meaningful assertion or threshold;
-   is understandable by the learner;
-   follows starter conventions;
-   can be rerun;
-   does not rely on fabricated evidence.

Initial target:

-   experienced QA new to framework: `< 15 min`;
-   automation beginner: `< 30 min`.

## Supporting Metrics

-   first-run success rate;
-   Learn Mode completion rate;
-   generated-test execution success rate;
-   quality-gate pass rate after first repair loop;
-   CI onboarding completion rate;
-   percentage of users who can explain the generated test;
-   adapter conformance pass rate.
