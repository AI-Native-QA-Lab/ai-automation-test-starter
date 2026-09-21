import { z } from 'zod';

export const ModeSchema = z.enum(['learn', 'build', 'agent']);
export type Mode = z.infer<typeof ModeSchema>;

export function canTransitionMode(from: Mode, to: Mode): boolean {
  if (from === to) {
    return true;
  }

  return from === 'learn' && to === 'build' || from === 'build' && to === 'agent';
}

const EvidenceSummarySchema = z.object({
  summary: z.string().min(1)
});

export const EvidenceSchema = z.union([
  EvidenceSummarySchema.extend({
    source: z.literal('execution'),
    command: z.string().min(1),
    status: z.enum(['passed', 'failed', 'blocked', 'not_run']),
    output: z.string().optional()
  }),
  EvidenceSummarySchema.extend({
    source: z.enum(['suggestion', 'static', 'ci', 'human']),
    status: z.enum(['passed', 'failed', 'blocked', 'not_run']).optional(),
    output: z.string().optional()
  })
]);
export type Evidence = z.infer<typeof EvidenceSchema>;

export const QualityFindingSchema = z.object({
  ruleId: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.string().min(1),
  message: z.string().min(1),
  evidence: z.object({
    file: z.string().min(1),
    line: z.number().int().positive().optional()
  }),
  remediation: z.string().min(1),
  source: z.enum(['static', 'model-assisted', 'execution'])
});
export type QualityFinding = z.infer<typeof QualityFindingSchema>;

export const SkillSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().min(1),
  inputs: z.array(z.string().min(1)).min(1),
  outputs: z.array(z.string().min(1)).min(1)
});
export type Skill = z.infer<typeof SkillSchema>;

export const WorkflowSchema = z.object({
  id: z.string().min(1),
  mode: ModeSchema,
  steps: z.array(z.string().min(1)).min(1),
  maxIterations: z.number().int().positive(),
  evidenceSources: z.array(z.enum(['suggestion', 'static', 'execution', 'ci', 'human'])).min(1)
});
export type Workflow = z.infer<typeof WorkflowSchema>;

export const AdapterManifestSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  domain: z.enum(['api', 'performance', 'ui']),
  language: z.string().min(1),
  detection: z.object({ files: z.array(z.string().min(1)).min(1) }),
  commands: z.object({
    test: z.string().min(1),
    testOne: z.string().min(1)
  }),
  context: z.object({
    agents: z.string().min(1),
    skillNamespace: z.string().min(1)
  }),
  evidence: z.object({
    formats: z.array(z.string().min(1)).min(1)
  }),
  quality: z.object({
    rules: z.array(z.string().min(1)).min(1)
  })
});
export type AdapterManifest = z.infer<typeof AdapterManifestSchema>;

export const ProviderCapabilitiesSchema = z.object({
  structuredOutput: z.boolean(),
  toolCalling: z.boolean(),
  contextSize: z.number().int().positive(),
  streaming: z.boolean(),
  vision: z.boolean()
});
export type ProviderCapabilities = z.infer<typeof ProviderCapabilitiesSchema>;

export const ModelRequestSchema = z.object({
  prompt: z.string().min(1),
  responseFormat: z.enum(['text', 'json'])
});
export type ModelRequest = z.infer<typeof ModelRequestSchema>;

export const ModelResponseSchema = z.object({
  text: z.string(),
  structured: z.unknown().optional()
});
export type ModelResponse = z.infer<typeof ModelResponseSchema>;

export interface ModelProvider {
  readonly id: string;
  capabilities(): ProviderCapabilities;
  invoke(request: ModelRequest): Promise<ModelResponse>;
}

export const LoopStateSchema = z.object({
  objective: z.string().min(1),
  iteration: z.number().int().nonnegative(),
  summaries: z.array(z.string())
});
export type LoopState = z.infer<typeof LoopStateSchema>;
