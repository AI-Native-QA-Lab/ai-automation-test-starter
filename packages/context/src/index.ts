export interface RepositoryContextInput {
  objective: string;
  files: string[];
  target?: string;
  repositoryRules?: string[];
  examples?: string[];
}

export interface RepositoryContext {
  text: string;
  relevantFiles: string[];
  assumptions: string[];
}

const irrelevantPath = /^(?:\.git|node_modules|dist|coverage)(?:\/|$)/;

export function buildRepositoryContext(input: RepositoryContextInput): RepositoryContext {
  const relevantFiles = [...new Set(input.files.filter((file) => !irrelevantPath.test(file)))].sort();
  const assumptions = input.target?.trim() ? [] : ['API target is not provided'];
  const target = input.target?.trim() || 'UNKNOWN (not provided)';
  const rules = input.repositoryRules?.length ? input.repositoryRules.join('; ') : 'No repository-specific rules supplied';
  const examples = input.examples?.length ? input.examples.join('; ') : 'No examples supplied';

  const text = [
    `Objective: ${input.objective}`,
    `Target: ${target}`,
    `Relevant files: ${relevantFiles.join(', ') || 'none'}`,
    `Repository rules: ${rules}`,
    `Examples: ${examples}`,
    `Assumptions: ${assumptions.join('; ') || 'none'}`
  ].join('\n');

  return { text, relevantFiles, assumptions };
}
