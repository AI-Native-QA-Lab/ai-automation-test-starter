import { fileURLToPath } from 'node:url';
import { copyTemplateTree, type CopyResult } from '../filesystem.js';

export interface InitOptions {
  templateRoot?: string;
}

export async function initProject(root: string, options: InitOptions = {}): Promise<CopyResult> {
  const templateRoot = options.templateRoot ?? fileURLToPath(new URL('../../../../templates/pytest-api', import.meta.url));
  return copyTemplateTree(templateRoot, root);
}
