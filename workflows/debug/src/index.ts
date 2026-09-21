export type FailureCategory =
  | 'none'
  | 'environment'
  | 'dependency'
  | 'target_unavailable'
  | 'authentication'
  | 'data'
  | 'assertion'
  | 'test_implementation'
  | 'product_behavior'
  | 'flaky_timeout'
  | 'unknown';

export interface FailureInput {
  exitCode: number;
  output: string;
  timedOut?: boolean;
}

export interface FailureClassification {
  category: FailureCategory;
  confidence: 'high' | 'medium' | 'low';
  summary: string;
  nextAction: string;
}

function classification(
  category: FailureCategory,
  confidence: FailureClassification['confidence'],
  summary: string,
  nextAction: string
): FailureClassification {
  return { category, confidence, summary, nextAction };
}

export function classifyFailure(input: FailureInput): FailureClassification {
  if (input.exitCode === 0) {
    return classification('none', 'high', 'The native test command passed.', 'Continue to review the test quality.');
  }

  const output = input.output.toLowerCase();
  if (input.timedOut || /timed? ?out|timeout|flaky/.test(output)) {
    return classification(
      'flaky_timeout',
      'high',
      'The execution exceeded its time boundary or reported a flaky timeout.',
      'Inspect synchronization, target availability, and the execution budget.'
    );
  }
  if (/modulenotfounderror|no module named|importerror|could not import/.test(output)) {
    return classification(
      'dependency',
      'high',
      'The test environment could not import a required dependency.',
      'Install or configure the missing dependency before changing the assertion.'
    );
  }
  if (/command not found|executable.*not found|permission denied|python.*not found/.test(output)) {
    return classification(
      'environment',
      'high',
      'The native test environment is unavailable or not executable.',
      'Run the environment doctor checks and repair the local toolchain.'
    );
  }
  if (/\b401\b|\b403\b|unauthori[sz]ed|forbidden|authentication/.test(output)) {
    return classification(
      'authentication',
      'high',
      'The target rejected the request credentials or authentication state.',
      'Verify the approved environment configuration without placing credentials in source.'
    );
  }
  if (/connection refused|could not resolve|host.*unreachable|target unavailable|\b404\b/.test(output)) {
    return classification(
      'target_unavailable',
      'high',
      'The declared target was unavailable or could not be reached.',
      'Verify the target contract and environment before changing the test.'
    );
  }
  if (/product defect|unexpected server behavior|server returned an unexpected/.test(output)) {
    return classification(
      'product_behavior',
      'high',
      'The failure output explicitly identifies unexpected product behavior.',
      'Preserve the failing evidence and involve the product owner or service owner.'
    );
  }
  if (/fixture.*not found|missing.*data|jsondecodeerror|validationerror/.test(output)) {
    return classification(
      'data',
      'medium',
      'The test data or fixture setup does not match the required input.',
      'Inspect fixture scope, input shape, and environment data before changing behavior.'
    );
  }
  if (/syntaxerror|indentationerror|nameerror|typeerror/.test(output)) {
    return classification(
      'test_implementation',
      'medium',
      'The test implementation raised a language or API usage error.',
      'Repair the test implementation and rerun the native command.'
    );
  }
  if (/assertionerror|assert .*failed|assertion failed/.test(output)) {
    return classification(
      'assertion',
      'medium',
      'The test assertion did not match the observed result.',
      'Compare the declared objective, observed output, and expected behavior before editing.'
    );
  }

  return classification(
    'unknown',
    'low',
    'The available output is not sufficient for a reliable diagnosis.',
    'Collect more execution evidence instead of guessing or weakening the test.'
  );
}
