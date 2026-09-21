import { parseDocument } from 'yaml';

export type ShipCheckId =
  | 'yaml-parse'
  | 'workflow-name'
  | 'read-permission'
  | 'checkout'
  | 'python-setup'
  | 'python-version'
  | 'pip-cache'
  | 'dependency-install'
  | 'native-test-command'
  | 'report-artifact'
  | 'secret-placeholder';

export interface ShipCheck {
  id: ShipCheckId;
  passed: boolean;
  message: string;
}

export interface ShipValidationResult {
  passed: boolean;
  checks: ShipCheck[];
}

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null;
}

function workflowSteps(workflow: RecordValue): RecordValue[] {
  const jobs = isRecord(workflow.jobs) ? workflow.jobs : {};
  const steps: RecordValue[] = [];
  for (const job of Object.values(jobs)) {
    if (!isRecord(job) || !Array.isArray(job.steps)) {
      continue;
    }
    for (const step of job.steps) {
      if (isRecord(step)) {
        steps.push(step);
      }
    }
  }
  return steps;
}

function actionSteps(steps: RecordValue[], action: string): RecordValue[] {
  return steps.filter((step) =>
    typeof step.uses === 'string' && step.uses.startsWith(action) && /@v\d+$/.test(step.uses)
  );
}

function stepRunText(steps: RecordValue[]): string {
  return steps
    .filter((step) => typeof step.run === 'string')
    .map((step) => step.run as string)
    .join('\n');
}

function hasEditableInstall(steps: RecordValue[]): boolean {
  return steps.some((step) => {
    if (typeof step.run !== 'string') {
      return false;
    }
    return step.run.split(/\r?\n/).some((line) =>
      /\bpython(?:3)?\s+-m\s+pip\s+install\b[^\n]*(?:-e|--editable)\s+\./.test(line)
    );
  });
}

function junitReportPath(steps: RecordValue[]): string | null {
  for (const step of steps) {
    if (typeof step.run !== 'string') {
      continue;
    }
    const match = /--junitxml=(?:"([^"]+)"|'([^']+)'|(\S+))/.exec(step.run);
    const path = match?.[1] ?? match?.[2] ?? match?.[3];
    if (path) {
      return path;
    }
  }
  return null;
}

function uploadsReport(steps: RecordValue[], reportPath: string | null): boolean {
  if (reportPath === null) {
    return false;
  }
  return actionSteps(steps, 'actions/upload-artifact@v').some((step) => {
    const options = isRecord(step.with) ? step.with : {};
    return options.path === reportPath;
  });
}

function containsApiSecretPlaceholder(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.includes('${{ secrets.API_BASE_URL }}');
  }
  if (Array.isArray(value)) {
    return value.some((item) => containsApiSecretPlaceholder(item));
  }
  if (isRecord(value)) {
    return Object.values(value).some((item) => containsApiSecretPlaceholder(item));
  }
  return false;
}

function setupPythonVersion(steps: RecordValue[]): string | null {
  const setup = actionSteps(steps, 'actions/setup-python@v');
  for (const step of setup) {
    const withOptions = isRecord(step.with) ? step.with : {};
    const version = withOptions['python-version'];
    if (typeof version === 'string' || typeof version === 'number') {
      return String(version).trim();
    }
  }
  return null;
}

export function validatePytestCiWorkflow(workflow: string, nativeCommand = 'python -m pytest'): ShipValidationResult {
  const document = parseDocument(workflow);
  const yamlValid = document.errors.length === 0;
  let parsed: RecordValue = {};
  if (yamlValid) {
    try {
      const value = document.toJS();
      if (isRecord(value)) {
        parsed = value;
      }
    } catch {
      // The YAML parse check remains the source of truth for malformed input.
    }
  }

  const steps = workflowSteps(parsed);
  const setupPython = actionSteps(steps, 'actions/setup-python@v');
  const runText = stepRunText(steps);
  const reportPath = junitReportPath(steps);
  const pythonVersion = setupPythonVersion(steps);
  const permissions = isRecord(parsed.permissions) ? parsed.permissions : {};

  const checks: ShipCheck[] = [
    {
      id: 'yaml-parse',
      passed: yamlValid,
      message: yamlValid
        ? 'Workflow is valid YAML.'
        : `Workflow YAML is invalid: ${document.errors[0]?.message ?? 'unknown parse error'}`
    },
    {
      id: 'workflow-name',
      passed: typeof parsed.name === 'string' && parsed.name.trim().length > 0,
      message: 'Workflow has a top-level name.'
    },
    {
      id: 'read-permission',
      passed: permissions.contents === 'read',
      message: 'Workflow limits repository contents permission to read.'
    },
    {
      id: 'checkout',
      passed: actionSteps(steps, 'actions/checkout@v').length > 0,
      message: 'Workflow checks out the repository.'
    },
    {
      id: 'python-setup',
      passed: setupPython.length > 0,
      message: 'Workflow selects a supported Python runtime.'
    },
    {
      id: 'python-version',
      passed: pythonVersion !== null && /^3\.(10|11|12|13)$/.test(pythonVersion),
      message: 'Workflow selects a supported Python version (3.10-3.13).'
    },
    {
      id: 'pip-cache',
      passed: setupPython.some((step) => isRecord(step.with) && step.with.cache === 'pip'),
      message: 'Workflow enables the setup-python pip cache.'
    },
    {
      id: 'dependency-install',
      passed: hasEditableInstall(steps),
      message: 'Workflow installs the starter package.'
    },
    {
      id: 'native-test-command',
      passed: runText.includes(nativeCommand),
      message: `Workflow runs the native command: ${nativeCommand}.`
    },
    {
      id: 'report-artifact',
      passed: uploadsReport(steps, reportPath),
      message: 'Workflow produces a JUnit report and uploads it as an artifact.'
    },
    {
      id: 'secret-placeholder',
      passed: containsApiSecretPlaceholder(parsed),
      message: 'Workflow documents the API base URL through a GitHub secret placeholder.'
    }
  ];

  return { passed: checks.every((check) => check.passed), checks };
}
