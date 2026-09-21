import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { doctorProject, type DoctorResult } from './commands/doctor.js';
import { initProject } from './commands/init.js';

export { commandExistsOnPath, doctorProject } from './commands/doctor.js';
export { initProject } from './commands/init.js';
export type { DoctorCheck, DoctorOptions, DoctorResult } from './commands/doctor.js';
export type { InitOptions } from './commands/init.js';

export interface CliIO {
  write(message: string): void;
}

function formatDoctor(result: DoctorResult): string {
  const lines = result.checks.map((check) => `[${check.status}] ${check.id}: ${check.message}`);
  lines.push(result.ready ? 'Ready for native Pytest execution.' : 'Not ready. Resolve the missing checks above.');
  return lines.join('\n');
}

export async function runCli(argv: string[], io: CliIO = { write: console.log }): Promise<number> {
  const [command, pathArgument] = argv;
  const root = resolve(pathArgument ?? process.cwd());

  if (command === 'init') {
    const result = await initProject(root);
    io.write(`Initialized ${root}\nCreated: ${result.created.length}\nSkipped: ${result.skipped.length}`);
    return 0;
  }

  if (command === 'doctor') {
    const result = await doctorProject(root);
    io.write(formatDoctor(result));
    return result.ready ? 0 : 1;
  }

  io.write('Usage: aits <init|doctor> [path]');
  return 1;
}

const entryPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (entryPath === fileURLToPath(import.meta.url)) {
  const exitCode = await runCli(process.argv.slice(2));
  process.exitCode = exitCode;
}
