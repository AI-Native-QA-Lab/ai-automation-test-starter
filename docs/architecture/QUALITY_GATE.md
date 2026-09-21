# Quality Gate

## Objective

Prevent the project from equating "AI generated code" with "good
automated test".

## Quality Dimensions

### Executability

Can the test be discovered and executed by the native framework?

### Meaningfulness

Does the test prove the declared objective?

### Integrity

Does the result come from actual execution?

### Maintainability

Does the test follow framework/repository conventions?

### Isolation

Can the test run independently where expected?

### Security

Are secrets and unsafe data handling avoided?

### Stability

Does the test avoid obvious sources of flakiness?

## Finding Contract

Each finding should contain:

``` yaml
ruleId: meaningful-assertion
severity: high
category: test-quality
message: The test verifies HTTP 200 but does not verify the stated voucher rule.
evidence:
  file: tests/test_voucher.py
  line: 42
remediation: Add an assertion that proves the business outcome.
source: static|model-assisted|execution
```

## Initial Rule Set

P0:

-   empty test;
-   `assert True` / unconditional pass;
-   swallowed assertion/exception;
-   hard-coded secret;
-   disabled test used to claim success;
-   no assertion/threshold;
-   fabricated network target when no explicit target contract is supplied;
-   objective-to-status assertion gap for status-oriented objectives.

P1:

-   arbitrary sleep;
-   objective-to-body assertion gap;
-   objective-to-business assertion gap for recognized domain terms;
-   excessive mocking;
-   execution-order dependency or shared global state;
-   duplicate call-based setup;
-   direct environment-variable indexing;
-   negative-path coverage guidance where the declared objective requires an
    error response.

The v0.1 static implementation uses conservative source checks: fabricated
targets require a literal URL without a supplied target, body guidance looks
for response fields or payload access, and business guidance checks recognized
domain terms in assertion lines. These findings are review signals, not proof
that a test is semantically complete.

## Auditor Integration

`ai-test-auditor` should be integrated through a contract or CLI
boundary rather than copied into this repository.

Possible flow:

``` text
Generated Test
    ↓
Native Run
    ↓
Quality Gate
    ↓
ai-test-auditor
    ↓
Combined Findings
```

## Rule

A model-generated quality opinion must be distinguishable from
deterministic/static or execution-derived evidence.
