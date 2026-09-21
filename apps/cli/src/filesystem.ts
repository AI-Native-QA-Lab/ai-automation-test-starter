import { constants } from 'node:fs';
import { copyFile, lstat, mkdir, readdir } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';

export interface CopyResult {
  created: string[];
  skipped: string[];
}

async function collectFiles(root: string, current = root): Promise<string[]> {
  const entries = await readdir(current, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(current, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(root, path));
    } else if (entry.isFile()) {
      files.push(relative(root, path));
    }
  }

  return files;
}

async function ensureSafeDirectory(path: string, recursive = false): Promise<void> {
  try {
    const stats = await lstat(path);
    if (!stats.isDirectory() || stats.isSymbolicLink()) {
      throw new Error(`Refusing to write through a non-directory path: ${path}`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
    await mkdir(path, { recursive });
    const stats = await lstat(path);
    if (!stats.isDirectory() || stats.isSymbolicLink()) {
      throw new Error(`Refusing to write through a non-directory path: ${path}`);
    }
  }
}

async function ensureSafeParentTree(root: string, directory: string): Promise<void> {
  await ensureSafeDirectory(root, true);
  const relativeDirectory = relative(root, directory);
  let current = root;
  for (const segment of relativeDirectory.split(sep).filter(Boolean)) {
    current = join(current, segment);
    await ensureSafeDirectory(current);
  }
}

export async function copyTemplateTree(sourceRoot: string, targetRoot: string): Promise<CopyResult> {
  const sourceFiles = await collectFiles(sourceRoot);
  const result: CopyResult = { created: [], skipped: [] };

  await ensureSafeDirectory(targetRoot, true);
  for (const relativePath of sourceFiles.sort()) {
    const sourcePath = join(sourceRoot, relativePath);
    const targetPath = join(targetRoot, relativePath);
    try {
      await lstat(targetPath);
      result.skipped.push(relativePath);
      continue;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }

    await ensureSafeParentTree(targetRoot, dirname(targetPath));
    try {
      await copyFile(sourcePath, targetPath, constants.COPYFILE_EXCL);
      result.created.push(relativePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        result.skipped.push(relativePath);
        continue;
      }
      throw error;
    }
  }

  return result;
}
