import { reviewPythonTest } from '@aits/quality';
import type { QualityFinding } from '@aits/contracts';

export interface PythonReviewInput {
  source: string;
  objective: string;
  file?: string;
  target?: string;
}

export interface PythonReviewResult {
  passed: boolean;
  findings: QualityFinding[];
  summary: string;
}

export function reviewPythonSource(input: PythonReviewInput): PythonReviewResult {
  const findings = reviewPythonTest(
    input.source,
    input.objective,
    input.file ?? 'test.py',
    input.target === undefined ? {} : { target: input.target }
  );
  return {
    passed: findings.length === 0,
    findings,
    summary: findings.length === 0
      ? 'Static review passed with no findings.'
      : `Static review found ${findings.length} finding${findings.length === 1 ? '' : 's'} requiring attention.`
  };
}
