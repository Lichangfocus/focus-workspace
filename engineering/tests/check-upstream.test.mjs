import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compareSemver } from '../scripts/check-upstream.mjs';

test('orders DSH release lines by SemVer, not publish time', () => {
  const ordered = ['0.1.5-rc.3', '0.1.6-alpha.1', '0.1.6-alpha.2', '0.1.7-alpha.1', '0.1.7-alpha.2', '0.1.7-rc.1', '0.1.7-rc.2', '0.1.7'];
  assert.deepEqual([...ordered].reverse().sort(compareSemver), ordered);
  assert.ok(compareSemver('0.1.5-rc.3', '0.1.6-alpha.2') < 0);
  assert.ok(compareSemver('0.1.6-alpha.10', '0.1.6-alpha.2') > 0);
  assert.equal(compareSemver('1.0.0+build.1', '1.0.0'), 0);
});

test('rejects non-SemVer input', () => {
  assert.throws(() => compareSemver('latest', '0.1.0'), /not a SemVer/);
});
