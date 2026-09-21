import { runBoundedLoop } from '@aits/ai-runtime';
import { EvidenceSchema, type Evidence, type ModelProvider } from '@aits/contracts';
import { classifyFailure } from '@aits/workflow-debug';

export interface NativeRunResult {
  exitCode: number;
  output: string;
}

export type BuildPhase = 'plan' | 'repair' | 'review';
export type BuildAction = 'plan' | 'generate' | 'diagnose' | 'repair' | 'review' | 'run';

export interface BuildSuggestion {
  action: BuildAction;
  summary: string;
  file?: string;
  content?: string;
}

export interface BuildChangeResult {
  applied: boolean;
  summary: string;
}

export interface BuildReviewInput {
  suggestion: BuildSuggestion;
  nativeResult: NativeRunResult;
  target: string;
}

export interface BuildReviewResult {
  passed: boolean;
  summary: string;
}

export interface BuildWorkflowInput {
  objective: string;
  target?: string;
  currentContent?: string;
  provider: ModelProvider;
  runNative: (command: string) => Promise<NativeRunResult>;
  applyChange?: (suggestion: BuildSuggestion) => Promise<BuildChangeResult>;
  review?: (input: BuildReviewInput) => Promise<BuildReviewResult>;
  maxIterations?: number;
  maxToolExecutions?: number;
}

export interface BuildWorkflowResult {
  stopReason: Awaited<ReturnType<typeof runBoundedLoop>>['stopReason'];
  iterations: number;
  summaries: string[];
  evidence: Evidence[];
  phases: BuildPhase[];
  changes: BuildChangeResult[];
  review: BuildReviewResult | null;
  toolExecutions: number;
}

const buildActions = new Set<BuildAction>(['plan', 'generate', 'diagnose', 'repair', 'review', 'run']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function redactSensitiveText(value: string): string {
  return value.replace(
    /(["']?(?:password|token|api[_-]?key|secret|authorization)["']?\s*[:=]\s*["']?)([^"',\s}]+)(["']?)/gi,
    '$1[REDACTED]$3'
  );
}

function suggestionFromResponse(response: { text: string; structured?: unknown }, phase: BuildPhase): BuildSuggestion {
  if (isRecord(response.structured) && buildActions.has(response.structured.action as BuildAction)) {
    return {
      action: response.structured.action as BuildAction,
      summary: typeof response.structured.summary === 'string' && response.structured.summary.trim()
        ? response.structured.summary
        : response.text || 'Provider returned a build suggestion',
      ...(typeof response.structured.file === 'string' ? { file: response.structured.file } : {}),
      ...(typeof response.structured.content === 'string' ? { content: response.structured.content } : {})
    };
  }

  return {
    action: phase === 'repair' ? 'diagnose' : 'plan',
    summary: response.text || 'Provider returned a build suggestion'
  };
}

function assertionCount(source: string): number {
  return source.split(/\r?\n/).filter((line) => /\bassert\b|\bexpect\s*\(|\bcheck\s*\(/.test(line)).length;
}

function assertionRegression(suggestion: BuildSuggestion, currentContent?: string): string | null {
  if (suggestion.content === undefined) {
    return null;
  }

  const proposedAssertions = assertionCount(suggestion.content);
  if (proposedAssertions === 0) {
    return 'generated change contains no executable assertion';
  }

  if (currentContent !== undefined && proposedAssertions < assertionCount(currentContent)) {
    return 'generated change removes existing assertions';
  }

  return null;
}

export async function runBuildWorkflow(input: BuildWorkflowInput): Promise<BuildWorkflowResult> {
  const evidence: Evidence[] = [];
  const phases: BuildPhase[] = [];
  const changes: BuildChangeResult[] = [];
  let finalReview: BuildReviewResult | null = null;
  let nextPhase: BuildPhase = 'plan';
  const target = input.target?.trim();
  const maxIterations = input.maxIterations ?? 3;
  const maxToolExecutions = input.maxToolExecutions ?? maxIterations * 4;
  if (!Number.isInteger(maxToolExecutions) || maxToolExecutions < 1) {
    throw new Error('maxToolExecutions must be a positive integer');
  }
  let toolExecutions = 0;
  const consumeToolExecution = (): boolean => {
    if (toolExecutions >= maxToolExecutions) {
      return false;
    }
    toolExecutions += 1;
    return true;
  };

  const loop = await runBoundedLoop({
    objective: input.objective,
    maxIterations,
    step: async (state) => {
      if (!target) {
        return { kind: 'blocked' as const, reason: 'API target is not provided' };
      }

      const phase = nextPhase;
      phases.push(phase);
      if (!consumeToolExecution()) {
        return { kind: 'blocked' as const, reason: 'maximum tool execution budget reached' };
      }
      let response;
      try {
        response = await input.provider.invoke({
          prompt: [
            `Phase: ${phase}`,
            `Objective: ${input.objective}`,
            `Target: ${target}`,
            `Iteration: ${state.iteration}`,
            `Previous observations: ${state.summaries.join(' | ') || 'none'}`
          ].join('\n'),
          responseFormat: 'json'
        });
      } catch (error) {
        return { kind: 'environment-failure' as const, reason: `model provider failure: ${String(error)}` };
      }

      const suggestion = suggestionFromResponse(response, phase);

      evidence.push(EvidenceSchema.parse({
        source: 'suggestion',
        summary: suggestion.summary,
        status: 'not_run',
        output: response.structured !== undefined
          ? redactSensitiveText(JSON.stringify(response.structured))
          : undefined
      }));

      if (
        (suggestion.action === 'generate' || suggestion.action === 'repair') &&
        !input.applyChange
      ) {
        return {
          kind: 'blocked' as const,
          reason: 'explicit change application handler is required before native verification'
        };
      }

      if (
        (suggestion.action === 'generate' || suggestion.action === 'repair') &&
        !input.review
      ) {
        return {
          kind: 'blocked' as const,
          reason: 'explicit build review handler is required before native verification'
        };
      }

      const assertionProblem = assertionRegression(suggestion, input.currentContent);
      if (assertionProblem !== null) {
        return { kind: 'blocked' as const, reason: assertionProblem };
      }

      if (
        input.applyChange &&
        (suggestion.action === 'generate' || suggestion.action === 'repair')
      ) {
        if (!consumeToolExecution()) {
          return { kind: 'blocked' as const, reason: 'maximum tool execution budget reached' };
        }
        let change: BuildChangeResult;
        try {
          change = await input.applyChange(suggestion);
        } catch (error) {
          return { kind: 'environment-failure' as const, reason: `change application failed: ${String(error)}` };
        }
        changes.push(change);
        if (!change.applied) {
          return { kind: 'blocked' as const, reason: `change was not applied: ${change.summary}` };
        }
      }

      if (!consumeToolExecution()) {
        return { kind: 'blocked' as const, reason: 'maximum tool execution budget reached' };
      }
      let nativeResult: NativeRunResult;
      try {
        nativeResult = await input.runNative('pytest');
      } catch (error) {
        return { kind: 'environment-failure' as const, reason: `native test runner unavailable: ${String(error)}` };
      }

      const passed = nativeResult.exitCode === 0;
      evidence.push(EvidenceSchema.parse({
        source: 'execution',
        summary: passed ? 'Native Pytest command completed successfully' : 'Native Pytest command failed',
        command: 'pytest',
        status: passed ? 'passed' : 'failed',
        output: nativeResult.output
      }));

      if (!passed) {
        const failure = classifyFailure({ exitCode: nativeResult.exitCode, output: nativeResult.output });
        if (failure.category === 'product_behavior') {
          return { kind: 'blocked' as const, reason: `likely product defect: ${failure.summary}` };
        }
        if (['environment', 'dependency', 'target_unavailable', 'authentication'].includes(failure.category)) {
          return { kind: 'environment-failure' as const, reason: failure.summary };
        }
        nextPhase = 'repair';
        return { kind: 'continue' as const, summary: 'native pytest failed; bounded repair remains' };
      }

      if (input.review) {
        phases.push('review');
        if (!consumeToolExecution()) {
          return { kind: 'blocked' as const, reason: 'maximum tool execution budget reached' };
        }
        try {
          finalReview = await input.review({ suggestion, nativeResult, target });
        } catch (error) {
          return { kind: 'environment-failure' as const, reason: `build review failed: ${String(error)}` };
        }
        evidence.push(EvidenceSchema.parse({
          source: 'static',
          summary: finalReview.summary,
          status: finalReview.passed ? 'passed' : 'failed'
        }));
        if (!finalReview.passed) {
          nextPhase = 'repair';
          return { kind: 'continue' as const, summary: 'native pytest passed; build review requires repair' };
        }
      }

      return {
        kind: 'done' as const,
        summary: finalReview ? 'native pytest passed and build review completed' : 'native pytest passed'
      };
    }
  });

  return { ...loop, evidence, phases, changes, review: finalReview, toolExecutions };
}
