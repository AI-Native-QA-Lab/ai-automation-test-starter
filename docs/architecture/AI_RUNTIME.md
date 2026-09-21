# AI Runtime and Agent Loop

## Runtime Goals

-   model-agnostic;
-   observable;
-   bounded;
-   testable without a real model;
-   evidence-aware;
-   safe for beginner workflows.

## Provider Contract

Conceptual interface:

``` ts
interface ModelProvider {
  id: string;
  capabilities(): ProviderCapabilities;
  invoke(request: ModelRequest): Promise<ModelResponse>;
}
```

Provider capability examples:

-   structured output;
-   tool calling;
-   context size;
-   streaming;
-   vision.

Do not force every provider into a lowest-common-denominator
implementation. Workflows may declare required capabilities.

### OpenAI-Compatible Provider

The first remote-provider implementation uses the OpenAI Chat Completions
wire format without importing a vendor SDK. Its configuration requires an
endpoint, model name, and advertised context size. An API key is optional so
that compatible local or gateway endpoints can be used without changing the
core contract.

The provider supports:

-   text responses and JSON structured responses;
-   an injected `fetch` implementation for deterministic tests;
-   request timeouts and bounded exponential retry for network errors,
    timeouts, and transient HTTP statuses (`408`, `429`, `5xx`);
-   a configurable prompt-character guard when the caller needs a local
    context preflight;
-   explicit errors for context-limit, timeout, network, HTTP, and malformed
    provider responses.

The character guard is not a tokenizer. Callers must configure it according
to the selected model when a token-accurate limit is required. Provider
suggestions remain separate from native test execution evidence.

## Loop

``` text
Objective
   ↓
Plan
   ↓
Action
   ↓
Tool / File / Native Test Runner
   ↓
Observation
   ↓
Evaluate
   ├── done
   ├── continue
   ├── blocked
   └── human decision
```

## Loop State

Minimum:

-   objective;
-   iteration;
-   actions;
-   observations;
-   evidence refs;
-   assumptions;
-   unresolved questions;
-   stop reason.

Build workflows keep iteration and tool budgets separate. A workflow may
have several provider, file-change, native-runner, and review calls inside one
iteration, so reaching the tool budget must stop before the next call rather
than silently extending the loop.

Generated or repaired changes also require an explicit host review callback
before native verification. A passing native command without that review is
execution evidence, not a completed build review.

When inline generated content is available, Build also blocks a change that
contains no executable assertion or removes assertions from the supplied
current content. The host review callback remains responsible for semantic
assertion quality and changes whose content is applied outside the suggestion.

## Stop Conditions

-   objective verified;
-   max iterations reached;
-   environment unavailable;
-   required information missing;
-   likely product defect;
-   security boundary;
-   user approval required.

## Failure Rule

The runtime must never "fix" a failing test by:

-   deleting the assertion;
-   changing expected behavior without evidence;
-   skipping the test;
-   swallowing exceptions;
-   replacing the real target with a mock without approval.

## CI Strategy

Use deterministic fake provider scenarios to test loop behavior.

Real-model tests are optional smoke/evaluation jobs.
