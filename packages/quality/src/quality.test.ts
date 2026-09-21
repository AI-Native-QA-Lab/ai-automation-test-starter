import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { reviewPythonTest } from './index.js';

function fixture(name: string): string {
  return readFileSync(`tests/fixtures/quality/${name}`, 'utf8');
}

describe('static test-quality gate', () => {
  it('finds unconditional passes, swallowed exceptions, and hard-coded secrets', () => {
    const findings = reviewPythonTest(fixture('bad_test.py'), 'validate voucher status');
    const ruleIds = findings.map((finding) => finding.ruleId);

    expect(ruleIds).toEqual(expect.arrayContaining(['always-pass', 'swallowed-exception', 'hard-coded-secret']));
    expect(findings.every((finding) => finding.source === 'static')).toBe(true);
  });

  it('does not report the clean deterministic test as a fake pass', () => {
    expect(reviewPythonTest(fixture('good_test.py'), 'validate service status')).toEqual([]);
  });

  it('warns about arbitrary sleeps and missing assertions', () => {
    const findings = reviewPythonTest('def test_empty():\n    time.sleep(2)\n    pass\n', 'validate response');
    const ruleIds = findings.map((finding) => finding.ruleId);

    expect(ruleIds).toEqual(expect.arrayContaining(['arbitrary-sleep', 'no-assertion']));
  });

  it('finds swallowed assertions even when logging appears before pass', () => {
    const findings = reviewPythonTest([
      'def test_health():',
      '    try:',
      '        assert response["status"] == "ok"',
      '    except AssertionError:',
      '        logger.warning("unexpected status")',
      '        pass'
    ].join('\n'), 'validate service status');

    expect(findings.map((finding) => finding.ruleId)).toContain('swallowed-exception');
  });

  it('flags a status objective when the assertion does not address status', () => {
    const findings = reviewPythonTest([
      'def test_health():',
      '    response = get_health()',
      '    assert response is not None'
    ].join('\n'), 'validate service status');

    expect(findings.map((finding) => finding.ruleId)).toContain('objective-assertion-gap');
  });

  it('guides negative-path coverage when the objective requires an error response', () => {
    const findings = reviewPythonTest([
      'def test_health_error():',
      '    response = get_health()',
      '    assert response["status"] == "ok"'
    ].join('\n'), 'validate the invalid request error response');

    expect(findings.map((finding) => finding.ruleId)).toContain('negative-path-gap');
  });

  it('guides body and business assertions instead of accepting a generic response check', () => {
    const findings = reviewPythonTest([
      'def test_voucher():',
      '    response = get_voucher()',
      '    assert response is not None'
    ].join('\n'), 'validate the voucher discount in the response body');
    const ruleIds = findings.map((finding) => finding.ruleId);

    expect(ruleIds).toEqual(expect.arrayContaining([
      'objective-body-assertion-gap',
      'objective-business-assertion-gap'
    ]));
  });

  it('flags fabricated endpoint metadata when no target contract is supplied', () => {
    const source = [
      'import requests',
      '',
      'def test_health():',
      '    response = requests.get("https://invented.example.test/health")',
      '    assert response.status_code == 200'
    ].join('\n');

    expect(reviewPythonTest(source, 'validate the health status').map((finding) => finding.ruleId))
      .toContain('fabricated-target');
    expect(reviewPythonTest(source, 'validate the health status', 'test.py', { target: 'approved fixture' }))
      .not.toEqual(expect.arrayContaining([expect.objectContaining({ ruleId: 'fabricated-target' })]));
  });

  it('warns about order, environment, and duplicated setup coupling', () => {
    const findings = reviewPythonTest([
      'import os',
      'import pytest',
      '',
      '@pytest.mark.order(1)',
      'def test_voucher():',
      '    token = os.environ["API_TOKEN"]',
      '    response = get_voucher()',
      '    response = get_voucher()',
      '    assert response is not None'
    ].join('\n'), 'validate the voucher response');
    const ruleIds = findings.map((finding) => finding.ruleId);

    expect(ruleIds).toEqual(expect.arrayContaining([
      'execution-order-dependency',
      'environment-coupling',
      'duplicate-setup'
    ]));
  });
});
