import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pytestApiManifest } from './manifest.js';

const projectFiles = ['pyproject.toml', 'pytest.ini', 'tox.ini', 'setup.cfg'] as const;
const reportFiles = new Set(['junit.xml', 'pytest-results.xml', 'test-results.xml']);

export interface PytestDetection {
  detected: boolean;
  adapterId: string | null;
  status: 'detected' | 'missing';
  matchedFiles: string[];
  reason: string;
}

async function readIfPresent(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return null;
  }
}

function containsPytestSignal(file: string, content: string): boolean {
  if (file === 'pytest.ini') {
    return true;
  }

  return /\bpytest\b|\[tool\.pytest(?:\.|\])|\[pytest\]/i.test(content);
}

export async function detectPytestProject(root: string): Promise<PytestDetection> {
  const matchedFiles: string[] = [];
  for (const file of projectFiles) {
    const content = await readIfPresent(join(root, file));
    if (content !== null && containsPytestSignal(file, content)) {
      matchedFiles.push(file);
    }
  }

  if (matchedFiles.length > 0) {
    return {
      detected: true,
      adapterId: pytestApiManifest.id,
      status: 'detected',
      matchedFiles,
      reason: `Detected Pytest configuration in ${matchedFiles.join(', ')}`
    };
  }

  return {
    detected: false,
    adapterId: null,
    status: 'missing',
    matchedFiles: [],
    reason: 'No supported Pytest configuration was found'
  };
}

export interface PytestContext {
  adapterId: string | null;
  status: PytestDetection['status'];
  relevantFiles: string[];
  fixtureFiles: string[];
  conventions: string[];
  unknowns: string[];
  evidenceLocations: string[];
}

function observedEvidenceLocations(entries: import('node:fs').Dirent[], detected: boolean): string[] {
  if (!detected) {
    return [];
  }

  return [
    ...entries
      .filter((entry) => entry.isFile() && reportFiles.has(entry.name))
      .map((entry) => entry.name),
    'terminal'
  ].sort();
}

export async function buildPytestContext(root: string): Promise<PytestContext> {
  const detected = await detectPytestProject(root);
  const entries = await readdir(root, { withFileTypes: true });
  const relevantFiles = [...detected.matchedFiles];
  const fixtureFiles: string[] = [];

  if (entries.some((entry) => entry.isFile() && entry.name === 'AGENTS.md')) {
    relevantFiles.push('AGENTS.md');
  }
  if (entries.some((entry) => entry.isFile() && entry.name === 'conftest.py')) {
    fixtureFiles.push('conftest.py');
  }
  if (entries.some((entry) => entry.isDirectory() && entry.name === 'tests')) {
    relevantFiles.push('tests/');
    fixtureFiles.push('tests/');
  }

  return {
    adapterId: detected.adapterId,
    status: detected.status,
    relevantFiles: [...new Set(relevantFiles)].sort(),
    fixtureFiles: fixtureFiles.sort(),
    conventions: ['Use native pytest commands', 'Keep API targets explicit'],
    unknowns: detected.detected
      ? ['API target is not provided']
      : [detected.reason],
    evidenceLocations: observedEvidenceLocations(entries, detected.detected)
  };
}

export async function hasPytestExecutable(root: string): Promise<boolean> {
  try {
    await access(join(root, '.venv', 'bin', 'pytest'));
    return true;
  } catch {
    return false;
  }
}
