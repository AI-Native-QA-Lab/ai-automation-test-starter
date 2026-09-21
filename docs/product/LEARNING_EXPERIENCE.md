# Learning Experience

## Product Thesis

AI should reduce the friction of learning automation without removing
the learning.

## Progression

``` text
Level 0 — Explain
Level 1 — Coach
Level 2 — Assist
Level 3 — Build
Level 4 — Agent
```

## Learn Mode

Default for beginners.

Pattern:

``` text
Explain objective
 ↓
Show relevant framework concept
 ↓
Ask learner to implement a small step
 ↓
Run/review
 ↓
Explain feedback
 ↓
Next step
```

The AI should not immediately dump a complete solution unless requested.

## Build Mode

Default for users who understand the framework basics.

Pattern:

``` text
Analyze
 ↓
Design
 ↓
Generate
 ↓
Run
 ↓
Debug
 ↓
Review
 ↓
Explain key decisions
```

## Agent Mode

For advanced use after v0.9.

AI can execute the full bounded loop but still reports:

-   what changed;
-   why;
-   what was executed;
-   what evidence exists;
-   what remains uncertain.

## Learning Artifacts

Each starter should include:

``` text
01-first-test
02-assertions
03-fixtures-or-setup
04-data
05-negative-path
06-environment
07-debugging
08-ci
```

The exact concepts remain framework-specific.

## Explain-After-Build

After AI creates a test, it should explain:

1.  what the test proves;
2.  which framework concepts were used;
3.  why the assertions matter;
4.  likely flakiness/maintenance risks;
5.  one suggested next exercise.

## Anti-pattern

Do not optimize solely for "fewest prompts to generated code".

The project optimizes for:

> shortest path to a test the user can run, trust, maintain, and
> explain.
