# Competitive Landscape --- Research Conclusions

> This document records the strategic conclusions from the pre-project
> GitHub research. Repository activity and features change over time;
> re-verify before major roadmap decisions.

## Observed Categories

### Framework-specific agentic starters

Examples include agentic Playwright scaffolds that combine Playwright,
repository rules, skills, CI, and coding-agent support.

Implication:

> "Add AGENTS.md + skills + AI test generation to Playwright" is not
> sufficient differentiation.

### Agentic QA workflow projects

Some projects coordinate planning, test automation, regression,
issue/test-management integration, and release workflows.

Implication:

> "QA workflow + skills + agent" is also not an empty category.

### Unified QA platforms

Projects such as `zosma-qa` explore one CLI/config across Web, Mobile,
Load, and future API testing with AI support.

Implication:

> Do not make a universal QA CLI/framework the project's primary moat.

### Autonomous testing agents

Projects such as TestZeus Hercules focus on autonomous execution across
UI/API and other validation types.

Implication:

> Do not compete on "AI replaces the automation engineer".

### Official framework AI capabilities

Playwright itself provides planner/generator/healer-style agent
capabilities.

Implication:

> Integrate native capabilities where mature; do not rebuild them.

## Identified Opportunity

The strongest whitespace is the combination of:

-   beginner-first;
-   framework-native;
-   multi-domain learning;
-   progressive autonomy;
-   quality literacy;
-   verification/evidence;
-   AI test auditing;
-   CI onboarding.

## Strategic Position

``` text
Not:
Prompt → AI → Test Code

Instead:
Learn → Build → Verify → Ship
```

## Projects to Monitor

-   `idavidov13/agentic-playwright`
-   `upex-galaxy/agentic-qa-boilerplate`
-   `zosmaai/zosma-qa`
-   `test-zeus-ai/testzeus-hercules`
-   `qawolf/cli`
-   Playwright official test-agent capabilities
-   API automation agents using OpenAPI/Postman inputs
-   mobile agent runtimes such as `callstack/agent-device`

## What to Learn

-   rule-driven agent context;
-   adapter/plugin boundaries;
-   official agent integrations;
-   deterministic CLI onboarding;
-   skills as reusable agent knowledge;
-   explicit agent loops;
-   CI-first engineering.

## What Not to Copy

-   framework abstraction for its own sake;
-   autonomous behavior before quality gates;
-   "zero code" as the main promise;
-   provider lock-in;
-   opaque AI-generated success claims;
-   broad multi-framework scope before one vertical slice works.

## Project Differentiator

> Beginner-first AI-native automation learning and engineering with
> framework-native execution and quality-gated AI output.
