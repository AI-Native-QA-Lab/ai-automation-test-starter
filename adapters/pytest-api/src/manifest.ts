import { AdapterManifestSchema, type AdapterManifest } from '@aits/contracts';

export const pytestApiManifest: AdapterManifest = AdapterManifestSchema.parse({
  id: 'pytest-api',
  displayName: 'Pytest API',
  domain: 'api',
  language: 'python',
  detection: {
    files: ['pyproject.toml', 'pytest.ini', 'tox.ini', 'setup.cfg']
  },
  commands: {
    test: 'pytest',
    testOne: 'pytest {path}'
  },
  context: {
    agents: 'AGENTS.md',
    skillNamespace: 'pytest-api'
  },
  evidence: {
    formats: ['junit', 'terminal']
  },
  quality: {
    rules: [
      'empty-test',
      'always-pass',
      'swallowed-exception',
      'hard-coded-secret',
      'disabled-test',
      'no-assertion',
      'fabricated-target',
      'objective-assertion-gap',
      'objective-body-assertion-gap',
      'objective-business-assertion-gap',
      'execution-order-dependency',
      'duplicate-setup',
      'environment-coupling',
      'arbitrary-sleep',
      'excessive-mocking',
      'negative-path-gap'
    ]
  }
});
