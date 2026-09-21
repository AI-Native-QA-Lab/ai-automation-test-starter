# Framework Adapter Design

## Purpose

An adapter teaches the project how to work *with* a native framework. It
does not replace the framework.

## Adapter Responsibilities

-   identify supported project;
-   describe framework capabilities;
-   identify relevant files;
-   provide native commands;
-   contribute AI context;
-   expose conventions;
-   locate execution evidence;
-   provide starter template metadata;
-   provide framework-specific quality rules.

## Non-Responsibilities

An adapter must not:

-   redefine assertion syntax;
-   implement a universal test API;
-   proxy every native command;
-   hide framework documentation;
-   fabricate unsupported capabilities.

## Proposed Manifest

``` yaml
id: pytest-api
displayName: Pytest API
domain: api
language: python

detection:
  files:
    - pyproject.toml
    - pytest.ini

commands:
  test: pytest
  testOne: pytest {path}

context:
  agents: AGENTS.md
  skillNamespace: pytest-api

evidence:
  formats:
    - junit
    - terminal

quality:
  rules:
    - meaningful-assertion
    - no-swallowed-exception
    - secrets-from-env
```

## Conformance Suite

Every adapter must pass:

-   manifest validation;
-   detection positive;
-   detection negative;
-   command resolution;
-   context build;
-   context reports observed fixtures, explicit unknowns, and evidence
    locations without assigning an adapter to an unrelated project;
-   evidence discovery reports the terminal and any observed root JUnit
    report (`junit.xml`, `pytest-results.xml`, or `test-results.xml`);
-   starter template run;
-   quality-rule registration.

## Adapter SDK Timing

Do not freeze the public SDK during v0.1.

Extract and stabilize it in v0.5 after three adapters exist.
