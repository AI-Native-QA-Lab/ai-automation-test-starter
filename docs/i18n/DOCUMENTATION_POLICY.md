# Documentation and Localization Policy

## Canonical Language

English is canonical for:

-   README;
-   architecture;
-   contracts;
-   API/CLI reference;
-   AGENTS.md;
-   contributor documentation;
-   release notes.

## Chinese Documentation

Simplified Chinese is a first-class localization.

Recommended layout:

``` text
docs/
├── en/
└── zh-CN/
```

Top-level canonical files remain English. Chinese entry points link to
localized equivalents.

The current Chinese entry point is [`docs/zh-CN/README.md`](../zh-CN/README.md).

## Source-code Language

-   identifiers: English;
-   code comments: English unless a localized example specifically
    teaches Chinese users;
-   commit/PR conventions: English recommended;
-   development discussion documents may be Chinese during early
    implementation, but public contract documents must be synchronized.

## Translation Rule

Localization may adapt explanation style but must not change:

-   commands;
-   contract semantics;
-   default behavior;
-   quality thresholds;
-   support status.

## Drift Check

Post-MVP, add a documentation drift check based on document IDs/headings
or metadata.

Do not duplicate independent English and Chinese product specifications.
