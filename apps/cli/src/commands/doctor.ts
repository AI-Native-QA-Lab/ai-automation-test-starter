import { constants } from 'node:fs';
import { access, readdir } from 'node:fs/promises';
import { delimiter, join } from 'node:path';
import { detectPytestProject } from '@aits/adapter-pytest-api';

export type DoctorStatus = 'detected' | 'missing' | 'unknown';

export interface DoctorCheck {
  id: 'project' | 'python' | 'pytest';
  status: DoctorStatus;
  message: string;
}

export interface DoctorOptions {
  commandExists?: (command: string) => Promise<boolean>;
}

export interface DoctorResult {
  checks: DoctorCheck[];
  ready: boolean;
}

export async function commandExistsOnPath(command: string, pathValue = process.env.PATH ?? ''): Promise<boolean> {
  const pathEntries = pathValue.split(delimiter).filter(Boolean);
  for (const entry of pathEntries) {
    try {
      await access(join(entry, command), constants.X_OK);
      return true;
    } catch {
      // Keep looking in the next PATH entry.
    }
  }
  return false;
}

const defaultCommandExists = (command: string): Promise<boolean> => commandExistsOnPath(command);

export async function doctorProject(root: string, options: DoctorOptions = {}): Promise<DoctorResult> {
  const commandExists = options.commandExists ?? defaultCommandExists;
  const detection = await detectPytestProject(root);
  const pythonAvailable = await commandExists('python3');
  const pytestAvailable = await commandExists('pytest');
  const checks: DoctorCheck[] = [
    {
      id: 'project',
      status: detection.detected ? 'detected' : 'missing',
      message: detection.reason
    },
    {
      id: 'python',
      status: pythonAvailable ? 'detected' : 'missing',
      message: pythonAvailable ? 'python3 is available' : 'Install Python 3 before running the starter'
    },
    {
      id: 'pytest',
      status: pytestAvailable ? 'detected' : 'missing',
      message: pytestAvailable ? 'pytest is available' : 'Install pytest before running native tests'
    }
  ];

  return { checks, ready: checks.every((check) => check.status === 'detected') };
}

export async function hasDirectory(root: string, name: string): Promise<boolean> {
  try {
    const entries = await readdir(root, { withFileTypes: true });
    return entries.some((entry) => entry.isDirectory() && entry.name === name);
  } catch {
    return false;
  }
}
