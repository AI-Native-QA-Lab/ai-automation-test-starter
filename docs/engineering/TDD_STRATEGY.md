# TDD Strategy

## Rule

All core contracts and behavior are developed test-first.

## Test Pyramid

### Unit

-   schemas;
-   parsers;
-   mode rules;
-   loop transitions;
-   quality rules.

### Contract

-   provider;
-   adapter;
-   skill;
-   workflow;
-   evidence.

### Integration

-   CLI + filesystem;
-   adapter + fixture project;
-   provider + workflow;
-   quality gate + generated test.

### E2E

Golden paths with deterministic fake provider.

## Golden E2E --- MVP

``` text
fixture Pytest project
 ↓
host invokes the Build workflow API
 ↓
fake provider returns planned structured actions
 ↓
test file created
 ↓
pytest executed
 ↓
result observed
 ↓
quality gate executed
 ↓
summary produced
```

The v0.1 CLI remains intentionally limited to `init` and `doctor`; Build is
exposed as a host-integrated workflow API rather than an interactive
`pnpm aits build` command.

## Architecture Tests

Enforce:

-   core does not import adapter implementation;
-   core does not import vendor model SDK;
-   quality contracts do not depend on UI;
-   adapters do not modify core state directly.

## Regression Fixtures

Maintain intentionally bad tests:

-   fake pass;
-   swallowed exception;
-   over-mocked API;
-   hard-coded secret;
-   brittle sleep;
-   weak assertion.

Every fixed false positive/negative becomes a fixture.

## Real-model Evaluation

Separate from CI correctness.

Use an evaluation suite to compare:

-   task completion;
-   test executability;
-   quality findings;
-   number of repair iterations;
-   unsupported assumptions.

Do not make deterministic unit tests depend on model behavior.
