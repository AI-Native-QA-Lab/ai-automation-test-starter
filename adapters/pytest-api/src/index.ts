export { buildPytestContext, detectPytestProject, hasPytestExecutable } from './detect.js';
export type { PytestContext, PytestDetection } from './detect.js';
export { pytestApiManifest } from './manifest.js';

export function resolvePytestCommand(path?: string): string {
  const normalizedPath = path?.trim();
  return normalizedPath ? `pytest ${normalizedPath}` : 'pytest';
}
