# GitHub Project Setup

## Repository Identity

### Recommended name

`ai-automation-test-starter`

### Alternative names

-   `ai-native-test-starter`
-   `agentic-test-starter`
-   `ai-test-engineering-starter`

Recommended default remains `ai-automation-test-starter` because it is
descriptive and does not over-promise autonomy.

## Description

> Beginner-first, AI-native test automation learning and engineering
> kit. Learn, build, verify, and ship reliable tests with
> framework-native workflows.

## Topics

``` text
ai-testing
test-automation
quality-engineering
qa
agentic-testing
pytest
playwright
k6
ai-agent
testing-tools
```

## License

Selected for this repository:

-   PolyForm Noncommercial License 1.0.0;
-   the complete text is kept in `LICENSE`;
-   the project README and package metadata point to the same license.

This selection overrides the earlier candidate list in the proposal and
is an explicit project decision from the repository owner.

## Branch Model

-   `main` protected;
-   short-lived feature branches;
-   PR required;
-   required CI;
-   squash merge recommended.

## Current CI Checks

-   install;
-   lint;
-   typecheck;
-   unit;
-   contract;
-   adapter conformance;
-   golden E2E;
-   docs structure checks;
-   starter smoke.

## Planned CI Hardening Checks

-   full documentation/link checks;
-   secret scan.

## Issue Labels

``` text
area:core
area:adapter
area:learning
area:quality
area:ai-runtime
area:docs
framework:pytest
framework:k6
framework:playwright
type:bug
type:feature
type:research
type:adr
good-first-issue
breaking-change
```

## Milestones

-   `MVP v0.1`
-   `v0.2 k6`
-   `v0.3 Playwright`
-   `v0.5 Adapter SDK`
-   `v0.7 Quality`
-   `v0.9 Agent`
-   `v1.0 Stable`

## Initial GitHub Issues

1.  Bootstrap monorepo and CI.
2.  Freeze core contracts.
3.  Implement fake model provider.
4.  Define adapter manifest.
5.  Implement Pytest API adapter.
6.  Create Pytest API starter template.
7.  Implement Learn Mode golden path.
8.  Implement Build Mode bounded loop.
9.  Implement native execution evidence.
10. Implement quality gate P0 rules.
11. Implement debug taxonomy.
12. Add GitHub Actions onboarding.
13. Add bilingual docs structure.
14. Run MVP usability validation.
15. Publish v0.1.

## Repository Files Before Public Launch

``` text
README.md
LICENSE
CONTRIBUTING.md
CODE_OF_CONDUCT.md
SECURITY.md
AGENTS.md
docs/product/PROJECT_CHARTER.md
docs/architecture/ARCHITECTURE.md
docs/product/ROADMAP.md
```

## Release Policy

Pre-1.0:

-   minor version may evolve contracts with migration notes;
-   every breaking contract change requires ADR/update;
-   adapters declare compatible core range.

v1.0:

-   semantic versioning for public contracts;
-   deprecation period for adapter APIs.
