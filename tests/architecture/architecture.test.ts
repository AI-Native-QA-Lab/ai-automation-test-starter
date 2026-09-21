import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function sourceFiles(root: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...sourceFiles(path));
    } else if (entry.isFile() && path.endsWith('.ts')) {
      files.push(path);
    }
  }
  return files;
}

describe('architecture boundaries', () => {
  it('keeps core packages independent from adapters and vendor providers', () => {
    const coreRoots = ['packages/contracts/src', 'packages/ai-runtime/src', 'packages/context/src', 'packages/quality/src'];
    const forbiddenImport = /from ['"][^'"]*(?:adapter-pytest|provider-openai|openai|anthropic|gemini)[^'"]*['"]/i;

    for (const relativeRoot of coreRoots) {
      for (const file of sourceFiles(resolve(relativeRoot))) {
        expect(readFileSync(file, 'utf8'), file).not.toMatch(forbiddenImport);
      }
    }

    const contextPackage = JSON.parse(readFileSync('packages/context/package.json', 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    expect(contextPackage.dependencies ?? {}).not.toHaveProperty('@aits/adapter-pytest-api');
  });

  it('keeps workflow source free from vendor SDK imports', () => {
    const forbiddenImport = /from ['"][^'"]*(?:openai|anthropic|gemini)[^'"]*['"]/i;

    for (const file of sourceFiles(resolve('workflows'))) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(forbiddenImport);
    }
  });
});
