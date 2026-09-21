# Roadmap

## Versioning Principle

Pre-1.0 versions validate contracts and product assumptions. v1.0
freezes only contracts that have been proven across at least three
distinct testing domains.

## MVP / v0.1 --- Pytest API

Theme: prove the complete experience.

Deliver:

-   contracts;
-   CLI;
-   Pytest API adapter;
-   Learn Mode;
-   Build Mode;
-   bounded loop;
-   quality gate v1;
-   CI onboarding;
-   bilingual documentation foundation.

## v0.2 --- k6 Performance

Theme: prove the architecture works outside functional testing.

New capabilities:

-   performance objective intake;
-   workload-model coaching;
-   VU vs arrival-rate explanation;
-   thresholds;
-   staged load;
-   result interpretation;
-   evidence from k6 output.

Important rule:

AI must not invent traffic targets or SLOs. Unknown performance targets
remain explicit assumptions.

## v0.3 --- Playwright UI

Theme: integrate instead of rebuilding mature agent capabilities.

Use native Playwright features and official agent capabilities where
appropriate.

Focus project value on:

-   beginner learning;
-   test design;
-   locator reasoning;
-   quality review;
-   flaky-test literacy;
-   CI;
-   explaining Planner/Generator/Healer output.

## v0.4 --- Common Skill Convergence

Extract proven common skills:

-   requirement-to-test;
-   test-design;
-   failure-analysis;
-   test-review;
-   test-data;
-   CI integration.

Keep framework skills separate.

## v0.5 --- Framework Adapter SDK

Freeze adapter interfaces only after Pytest, k6, and Playwright reveal
real differences.

Deliver:

-   adapter manifest;
-   capability model;
-   detection;
-   command metadata;
-   context contribution;
-   evidence contribution;
-   conformance test kit;
-   adapter authoring guide.

## v0.6 --- Starter Generator

Generate a framework-native starter from selected adapter/template.

The generator must not hide native commands.

## v0.7 --- Quality Gate 2.0

Integrate or interoperate with `ai-test-auditor`.

Add:

-   fake-test detection;
-   assertion-quality checks;
-   mock-abuse checks;
-   execution verification;
-   maintainability rules;
-   quality report contract.

## v0.8 --- Multi-model / Multi-harness

Validate:

-   OpenAI-compatible;
-   Anthropic;
-   Gemini;
-   local/OpenAI-compatible endpoints where practical.

Validate coding-agent/harness documentation for:

-   Codex;
-   Claude Code;
-   GitHub Copilot;
-   Cursor;
-   Gemini CLI;
-   OpenCode.

Avoid provider-specific behavior in core contracts.

## v0.9 --- Agent Mode

Introduce higher autonomy only after quality gates are mature.

Loop:

``` text
Plan
 ↓
Generate
 ↓
Execute
 ↓
Observe
 ↓
Diagnose
 ↓
Repair
 ↓
Verify
 ↓
Audit
 ↓
Stop / Continue
```

Required:

-   budgets;
-   stop conditions;
-   evidence;
-   human approval boundaries;
-   no silent test deletion/weakening.

## v1.0 --- Stable AI-native Starter

v1.0 criteria:

-   Pytest API validated;
-   k6 validated;
-   Playwright validated;
-   adapter SDK stable;
-   Learn/Build/Agent contracts documented;
-   quality gate stable;
-   provider contract stable;
-   bilingual docs;
-   deterministic CI;
-   security review;
-   public contribution guide.

## v1.x --- Ecosystem Expansion

Candidate adapters:

-   REST Assured;
-   SuperTest;
-   Bruno;
-   Postman/Newman;
-   Gatling;
-   JMeter;
-   Appium;
-   Airtest;
-   Cypress.

Add only when maintainers or real usage justify support.

## v1.x --- Ecosystem Integrations

Potential integrations:

-   `awesome-qa-skills`;
-   `ai-test-auditor`;
-   `ai-native-qa-agents`;
-   GitHub;
-   Jira;
-   test management tools;
-   MCP-based tooling.

## v2.0 --- Adaptive Learning & Engineering

Possible direction:

-   user proficiency model;
-   adaptive coaching;
-   project-aware learning plans;
-   cross-framework migration guidance;
-   richer evidence graph;
-   organization policies;
-   reusable team contracts.

v2.0 must not turn the project into a hosted platform by default.

## Post-v2.0 Exploration

-   shared/team mode;
-   remote execution orchestration;
-   plugin registry;
-   learning analytics;
-   quality knowledge graph.

These are explorations, not commitments.
