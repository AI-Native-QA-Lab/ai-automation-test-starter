import { QualityFindingSchema, type QualityFinding } from '@aits/contracts';

function finding(
  ruleId: string,
  severity: QualityFinding['severity'],
  message: string,
  remediation: string,
  file: string,
  line: number
): QualityFinding {
  return QualityFindingSchema.parse({
    ruleId,
    severity,
    category: 'test-quality',
    message,
    evidence: { file, line },
    remediation,
    source: 'static'
  });
}

function indentation(line: string): number {
  return line.match(/^\s*/)?.[0].replace(/\t/g, '    ').length ?? 0;
}

function handlerContainsBarePass(lines: string[], handlerIndex: number): boolean {
  const handlerIndent = indentation(lines[handlerIndex] ?? '');
  for (let index = handlerIndex + 1; index < lines.length; index += 1) {
    const candidate = lines[index] ?? '';
    if (candidate.trim().length === 0 || candidate.trim().startsWith('#')) {
      continue;
    }

    if (indentation(candidate) <= handlerIndent) {
      break;
    }
    if (candidate.trim() === 'pass') {
      return true;
    }
  }
  return false;
}

export interface PythonReviewOptions {
  target?: string;
}

export function reviewPythonTest(
  source: string,
  objective: string,
  file = 'test.py',
  options: PythonReviewOptions = {}
): QualityFinding[] {
  const lines = source.split(/\r?\n/);
  const findings: QualityFinding[] = [];
  const testDefinitionLines = lines
    .map((line, index) => ({ line, lineNumber: index + 1 }))
    .filter(({ line }) => /^\s*def\s+test_[A-Za-z0-9_]*\s*\(/.test(line));
  const objectiveText = objective.trim() ? ` for objective “${objective.trim()}”` : '';
  const assertionLines = lines.filter((line) => /^\s*(?:assert\b|expect\s*\(|check\s*\()/i.test(line));

  for (const [index, line] of lines.entries()) {
    const lineNumber = index + 1;
    if (/\bassert\s+(?:True|1)\b/.test(line)) {
      findings.push(finding(
        'always-pass',
        'high',
        `The assertion always passes${objectiveText}.`,
        'Assert the response or business outcome that proves the stated objective.',
        file,
        lineNumber
      ));
    }
    if (/(?:password|token|api[_-]?key|secret)\s*=\s*["'][^"']+["']/i.test(line)) {
      findings.push(finding(
        'hard-coded-secret',
        'critical',
        'A credential-like value is hard-coded in the test source.',
        'Read the value from an environment variable or an approved secret store.',
        file,
        lineNumber
      ));
    }
    if (/\b(?:time\.)?sleep\s*\(/.test(line)) {
      findings.push(finding(
        'arbitrary-sleep',
        'medium',
        'The test uses an arbitrary sleep that can create flakiness.',
        'Use a framework-native wait or synchronize on an observable condition.',
        file,
        lineNumber
      ));
    }
    if (/@pytest\.mark\.skip|@unittest\.skip/.test(line)) {
      findings.push(finding(
        'disabled-test',
        'high',
        'A disabled test cannot provide execution evidence for the objective.',
        'Remove the skip marker or record the environment blocker explicitly.',
        file,
        lineNumber
      ));
    }
    if (/\b(?:mock\.patch|Mock\(|MagicMock\()/.test(line)) {
      const mockCount = lines.filter((candidate) => /\b(?:mock\.patch|Mock\(|MagicMock\()/.test(candidate)).length;
      if (mockCount > 1 && !findings.some((item) => item.ruleId === 'excessive-mocking')) {
        findings.push(finding(
          'excessive-mocking',
          'medium',
          'The test relies on several mocks and may not exercise the target behavior.',
          'Keep only justified seams mocked and verify the real contract where possible.',
          file,
          lineNumber
        ));
      }
    }
    if (/^\s*except(?:\s+[^:]+)?:\s*$/.test(line)) {
      if (handlerContainsBarePass(lines, index)) {
        findings.push(finding(
          'swallowed-exception',
          'high',
          'The exception handler swallows a failure and can force a false pass.',
          'Fail explicitly or re-raise the exception after recording useful context.',
          file,
          lineNumber
        ));
      }
    }
  }

  for (const definition of testDefinitionLines) {
    const definitionIndex = definition.lineNumber - 1;
    const nextMeaningfulLine = lines.slice(definitionIndex + 1).find((candidate) => candidate.trim().length > 0);
    if (nextMeaningfulLine?.trim() === 'pass') {
      findings.push(finding(
        'empty-test',
        'high',
        'The test body is empty and proves nothing.',
        'Implement an assertion or remove the test until its objective is defined.',
        file,
        definition.lineNumber
      ));
    }
  }

  if (testDefinitionLines.length > 0 && !lines.some((line) => /\bassert\b|thresholds?\s*=|check\s*\(/.test(line))) {
    findings.push(finding(
      'no-assertion',
      'high',
      `The test has no meaningful assertion${objectiveText}.`,
      'Add an assertion or framework threshold that proves the declared objective.',
      file,
      testDefinitionLines[0]?.lineNumber ?? 1
    ));
  }

  if (testDefinitionLines.length > 0 && !options.target?.trim()) {
    const endpointLine = lines.findIndex((line) => /https?:\/\/[^\s"']+/i.test(line));
    if (endpointLine >= 0) {
      findings.push(finding(
        'fabricated-target',
        'high',
        'The test contains a literal network target without an explicit target contract.',
        'Provide the approved target as input and keep endpoint details tied to that contract.',
        file,
        endpointLine + 1
      ));
    }
  }

  const orderDependencyLine = lines.findIndex((line) => /pytest\.mark\.(?:order|dependency)\b|^\s*global\s+[A-Za-z_]/.test(line));
  if (testDefinitionLines.length > 0 && orderDependencyLine >= 0) {
    findings.push(finding(
      'execution-order-dependency',
      'medium',
      'The test relies on explicit ordering or shared global state.',
      'Make the fixture and setup self-contained so the test can run independently.',
      file,
      orderDependencyLine + 1
    ));
  }

  const environmentLine = lines.findIndex((line) => /\bos\.environ\s*\[/.test(line));
  if (testDefinitionLines.length > 0 && environmentLine >= 0) {
    findings.push(finding(
      'environment-coupling',
      'medium',
      'The test directly indexes an environment variable and may fail without explicit setup.',
      'Document the required variable and provide a safe, intentional configuration path.',
      file,
      environmentLine + 1
    ));
  }

  const setupOccurrences = new Map<string, number[]>();
  for (const [index, line] of lines.entries()) {
    const normalized = line.trim();
    if (/^[A-Za-z_][A-Za-z0-9_]*\s*=\s*[A-Za-z_][A-Za-z0-9_.]*\([^)]*\)$/.test(normalized)) {
      setupOccurrences.set(normalized, [...(setupOccurrences.get(normalized) ?? []), index + 1]);
    }
  }
  for (const occurrences of setupOccurrences.values()) {
    if (occurrences.length > 1) {
      findings.push(finding(
        'duplicate-setup',
        'low',
        'The same setup expression is repeated and may belong in a fixture.',
        'Extract reusable setup only when it improves isolation and keeps the native Pytest fixture visible.',
        file,
        occurrences[1] ?? occurrences[0] ?? 1
      ));
    }
  }

  const statusObjective = /\bstatus(?:\s+code)?\b|\bHTTP\b/i.test(objective);
  const statusAssertion = lines.some((line) =>
    /\bstatus(?:_code)?\b|status\s+code|http_status/i.test(line)
  );
  if (testDefinitionLines.length > 0 && statusObjective && !statusAssertion) {
    findings.push(finding(
      'objective-assertion-gap',
      'medium',
      `The test does not assert the status outcome required by the objective${objectiveText}.`,
      'Assert the response status or status code that directly proves the declared objective.',
      file,
      testDefinitionLines[0]?.lineNumber ?? 1
    ));
  }

  const bodyObjective = /\b(?:body|payload|schema|json|field|property|response data)\b/i.test(objective);
  const bodyAssertion = assertionLines.some((line) =>
    /\b(?:body|payload|json|schema)\b|response\s*(?:\[|\.)|\b(?:field|property)\b/i.test(line)
  );
  if (testDefinitionLines.length > 0 && bodyObjective && !bodyAssertion) {
    findings.push(finding(
      'objective-body-assertion-gap',
      'medium',
      `The test does not assert the response body or field required by the objective${objectiveText}.`,
      'Assert the relevant response field, payload, schema, or business data instead of only checking that a response exists.',
      file,
      testDefinitionLines[0]?.lineNumber ?? 1
    ));
  }

  const businessTerms = objective.match(/\b(?:voucher|discount|order|payment|amount|total|eligible|inventory|reservation|booking|permission|role)\b/gi) ?? [];
  const businessAssertion = businessTerms.some((term) =>
    assertionLines.some((line) => line.toLowerCase().includes(term.toLowerCase()))
  );
  if (testDefinitionLines.length > 0 && businessTerms.length > 0 && !businessAssertion) {
    findings.push(finding(
      'objective-business-assertion-gap',
      'medium',
      `The test does not assert the business outcome named by the objective${objectiveText}.`,
      'Assert the domain field or rule that proves the declared business behavior.',
      file,
      testDefinitionLines[0]?.lineNumber ?? 1
    ));
  }

  const negativeObjective = /\bnegative\b|\berror\b|\binvalid\b|\bunauthorized\b|\bnot found\b|\b(?:4|5)\d{2}\b/i.test(objective);
  const negativeEvidence = /\berror\b|\binvalid\b|\bunauthori[sz]ed\b|\bnot[_ ]found\b|\b(?:4|5)\d{2}\b|\b(?:401|403|404|422|500)\b/i.test(source);
  if (testDefinitionLines.length > 0 && negativeObjective && !negativeEvidence) {
    findings.push(finding(
      'negative-path-gap',
      'medium',
      `The objective requires an error or negative path, but the test only shows a normal response${objectiveText}.`,
      'Add an invalid-input or error-response case with an assertion for the expected failure status and body.',
      file,
      testDefinitionLines[0]?.lineNumber ?? 1
    ));
  }

  return findings;
}
