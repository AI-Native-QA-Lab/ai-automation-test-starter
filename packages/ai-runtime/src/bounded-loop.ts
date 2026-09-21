import type { LoopState } from '@aits/contracts';

export type LoopStepResult =
  | { kind: 'done'; summary: string }
  | { kind: 'continue'; summary: string }
  | { kind: 'blocked'; reason: string }
  | { kind: 'environment-failure'; reason: string };

export interface BoundedLoopInput {
  objective: string;
  maxIterations: number;
  step: (state: LoopState) => Promise<LoopStepResult>;
}

export type LoopStopReason =
  | 'verified'
  | 'max_iterations'
  | 'required_information_missing'
  | 'environment_unavailable'
  | 'human_decision_required';

export interface BoundedLoopResult {
  stopReason: LoopStopReason;
  iterations: number;
  summaries: string[];
}

function blockedReason(reason: string): LoopStopReason {
  return /missing|required target|not provided/i.test(reason)
    ? 'required_information_missing'
    : 'human_decision_required';
}

export async function runBoundedLoop(input: BoundedLoopInput): Promise<BoundedLoopResult> {
  if (!input.objective.trim()) {
    throw new Error('objective must not be empty');
  }
  if (!Number.isInteger(input.maxIterations) || input.maxIterations < 1) {
    throw new Error('maxIterations must be a positive integer');
  }

  const summaries: string[] = [];
  for (let iteration = 1; iteration <= input.maxIterations; iteration += 1) {
    const state: LoopState = { objective: input.objective, iteration, summaries: [...summaries] };
    const result = await input.step(state);
    summaries.push(result.kind === 'blocked' || result.kind === 'environment-failure' ? result.reason : result.summary);

    if (result.kind === 'done') {
      return { stopReason: 'verified', iterations: iteration, summaries };
    }
    if (result.kind === 'blocked') {
      return { stopReason: blockedReason(result.reason), iterations: iteration, summaries };
    }
    if (result.kind === 'environment-failure') {
      return { stopReason: 'environment_unavailable', iterations: iteration, summaries };
    }
  }

  return { stopReason: 'max_iterations', iterations: input.maxIterations, summaries };
}
