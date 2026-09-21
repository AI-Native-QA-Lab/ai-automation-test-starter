import { execFile } from 'node:child_process';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface NativePytestResult {
  exitCode: number;
  output: string;
}

export async function runNativePytest(root: string, pytestArgs: string[] = ['-q']): Promise<NativePytestResult> {
  const python = process.env.AITS_PYTHON
    ?? (process.env.VIRTUAL_ENV ? join(process.env.VIRTUAL_ENV, 'bin', 'python') : 'python3');
  try {
    const result = await execFileAsync(python, ['-m', 'pytest', ...pytestArgs], { cwd: root });
    return { exitCode: 0, output: `${result.stdout}${result.stderr}` };
  } catch (error) {
    const commandError = error as NodeJS.ErrnoException & {
      stdout?: string;
      stderr?: string;
      code?: number | string;
    };
    return {
      exitCode: typeof commandError.code === 'number' ? commandError.code : 1,
      output: `${commandError.stdout ?? ''}${commandError.stderr ?? commandError.message ?? ''}`
    };
  }
}
