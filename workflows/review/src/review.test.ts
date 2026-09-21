import { describe, expect, it } from 'vitest';
import { reviewPythonSource } from './index.js';

describe('Review workflow', () => {
  it('passes a meaningful deterministic test', () => {
    const result = reviewPythonSource({
      objective: 'validate service status',
      file: 'tests/test_health.py',
      source: [
        'def test_health(response):',
        '    assert response["status"] == "ok"'
      ].join('\n')
    });

    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('fails a test with a high-severity fake-pass finding and remediation', () => {
    const result = reviewPythonSource({
      objective: 'validate service status',
      source: [
        'def test_health():',
        '    assert True'
      ].join('\n')
    });

    expect(result.passed).toBe(false);
    expect(result.findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ ruleId: 'always-pass', source: 'static' })
    ]));
    expect(result.summary).toContain('finding');
  });

  it('passes the explicit target contract to static review', () => {
    const result = reviewPythonSource({
      objective: 'validate the health status',
      target: 'approved fixture target',
      source: [
        'import requests',
        '',
        'def test_health():',
        '    response = requests.get("https://approved.example.test/health")',
        '    assert response.status_code == 200'
      ].join('\n')
    });

    expect(result.findings).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ ruleId: 'fabricated-target' })
    ]));
  });
});
