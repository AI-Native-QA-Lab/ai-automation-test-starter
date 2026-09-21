import type { ModelProvider, ModelResponse } from '@aits/contracts';

export type LearnTurnStage = 'explanation' | 'review' | 'hint' | 'solution';

export type LearnNextAction =
  | 'submit_step'
  | 'request_hint'
  | 'submit_change'
  | 'request_solution';

export interface LearnTurn {
  stage: LearnTurnStage;
  message: string;
  concept: string;
  nextAction?: LearnNextAction;
  fullSolution?: string;
}

export type LearnModeErrorCode =
  | 'invalid_input'
  | 'invalid_state'
  | 'required_information_missing'
  | 'invalid_provider_response';

export class LearnModeError extends Error {
  readonly code: LearnModeErrorCode;

  constructor(code: LearnModeErrorCode, message: string) {
    super(message);
    this.name = 'LearnModeError';
    this.code = code;
  }
}

export interface LearnModeInput {
  objective: string;
  target?: string;
  provider: ModelProvider;
}

export interface LearnModeSession {
  readonly history: readonly LearnTurn[];
  start(): Promise<LearnTurn>;
  submitStep(step: string): Promise<LearnTurn>;
  submitChange(change: string): Promise<LearnTurn>;
  requestHint(): Promise<LearnTurn>;
  requestFullSolution(): Promise<LearnTurn>;
}

const stages = new Set<LearnTurnStage>(['explanation', 'review', 'hint', 'solution']);
const nextActions = new Set<LearnNextAction>([
  'submit_step',
  'request_hint',
  'submit_change',
  'request_solution'
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateTurn(response: ModelResponse, expectedStage: LearnTurnStage): LearnTurn {
  const value = response.structured;
  if (!isRecord(value) || !stages.has(value.stage as LearnTurnStage)) {
    throw new LearnModeError(
      'invalid_provider_response',
      'Learn Mode Provider response must contain a supported stage'
    );
  }
  const stage = value.stage as LearnTurnStage;
  if (!nonEmpty(value.message) || !nonEmpty(value.concept)) {
    throw new LearnModeError(
      'invalid_provider_response',
      'Learn Mode Provider response must contain message and concept'
    );
  }
  if (value.nextAction !== undefined && !nextActions.has(value.nextAction as LearnNextAction)) {
    throw new LearnModeError(
      'invalid_provider_response',
      'Learn Mode Provider response contains an unsupported next action'
    );
  }
  if (value.fullSolution !== undefined && !nonEmpty(value.fullSolution)) {
    throw new LearnModeError(
      'invalid_provider_response',
      'Learn Mode Provider fullSolution must not be empty'
    );
  }
  if (stage !== expectedStage) {
    throw new LearnModeError(
      'invalid_provider_response',
      `Learn Mode expected a ${expectedStage} response but received ${stage}`
    );
  }
  if (stage === 'solution' && value.fullSolution === undefined) {
    throw new LearnModeError(
      'invalid_provider_response',
      'A solution response must include fullSolution'
    );
  }
  if (stage !== 'solution' && value.fullSolution !== undefined) {
    throw new LearnModeError(
      'invalid_provider_response',
      'A full solution is not allowed before an explicit solution request'
    );
  }

  return {
    stage,
    message: value.message,
    concept: value.concept,
    ...(value.nextAction !== undefined ? { nextAction: value.nextAction as LearnNextAction } : {}),
    ...(value.fullSolution !== undefined ? { fullSolution: value.fullSolution } : {})
  };
}

function buildPrompt(
  objective: string,
  target: string,
  action: string,
  instruction: string,
  learnerInput?: string
): string {
  return [
    'You are a beginner-first Pytest API coach.',
    'Scenario: create one meaningful GET API test using native Pytest concepts.',
    `Objective: ${objective}`,
    `API target: ${target}`,
    `Action: ${action}`,
    'Return JSON only with stage, message, concept, nextAction, and fullSolution when explicitly allowed.',
    'Do not invent endpoint details, credentials, response fields, or expected business behavior.',
    instruction,
    ...(learnerInput ? [`Learner input:\n${learnerInput}`] : [])
  ].join('\n');
}

export function createLearnSession(input: LearnModeInput): LearnModeSession {
  if (!input.objective.trim()) {
    throw new LearnModeError('invalid_input', 'objective must not be empty');
  }

  let started = false;
  const history: LearnTurn[] = [];

  function requireStarted(): void {
    if (!started) {
      throw new LearnModeError('invalid_state', 'start the Learn Mode session first');
    }
  }

  function requireTarget(): string {
    const target = input.target?.trim();
    if (!target) {
      throw new LearnModeError('required_information_missing', 'API target is not provided');
    }
    return target;
  }

  async function invoke(
    target: string,
    expectedStage: LearnTurnStage,
    action: string,
    instruction: string,
    learnerInput?: string
  ): Promise<LearnTurn> {
    const response = await input.provider.invoke({
      prompt: buildPrompt(input.objective.trim(), target, action, instruction, learnerInput),
      responseFormat: 'json'
    });
    const turn = validateTurn(response, expectedStage);
    history.push(turn);
    return turn;
  }

  return {
    get history(): readonly LearnTurn[] {
      return [...history];
    },

    async start(): Promise<LearnTurn> {
      if (started) {
        throw new LearnModeError('invalid_state', 'Learn Mode session has already started');
      }
      const target = requireTarget();
      const turn = await invoke(
        target,
        'explanation',
        'explain_objective',
        'Explain the objective and one relevant native Pytest concept. Ask the learner to submit one small step. Do not provide a full solution.'
      );
      started = true;
      return turn;
    },

    async submitStep(step: string): Promise<LearnTurn> {
      requireStarted();
      if (!step.trim()) {
        throw new LearnModeError('invalid_input', 'learner step must not be empty');
      }
      return invoke(
        requireTarget(),
        'review',
        'review_learner_step',
        'Review the learner step, explain one useful correction or confirmation, and ask for the next small action. Do not provide a full solution.',
        step.trim()
      );
    },

    async submitChange(change: string): Promise<LearnTurn> {
      requireStarted();
      if (!change.trim()) {
        throw new LearnModeError('invalid_input', 'learner change must not be empty');
      }
      return invoke(
        requireTarget(),
        'review',
        'review_learner_change',
        'Review the learner change against the objective and Pytest concepts. Explain what it proves and one next improvement. Do not provide a full solution.',
        change.trim()
      );
    },

    async requestHint(): Promise<LearnTurn> {
      requireStarted();
      return invoke(
        requireTarget(),
        'hint',
        'give_hint',
        'Give one focused hint that helps the learner continue. Do not provide a full solution or a complete test body.'
      );
    },

    async requestFullSolution(): Promise<LearnTurn> {
      requireStarted();
      return invoke(
        requireTarget(),
        'solution',
        'provide_explicitly_requested_solution',
        'The learner explicitly requested the full solution. It is now allowed to provide a complete example, while explaining the native Pytest concepts and preserving unknown target details.'
      );
    }
  };
}
