#!/usr/bin/env node
// Checks whether DeepSeek Harness has published versions newer than the ones
// pinned by the desktop app. Reads npm registry metadata and GitHub releases,
// writes the result to .local/upstream/last-check.json, and prints a summary.
//
// Usage:
//   node engineering/scripts/check-upstream.mjs            # always query
//   node engineering/scripts/check-upstream.mjs --max-age 12h  # reuse a fresh result
//   node engineering/scripts/check-upstream.mjs --notify   # macOS notification for new versions
//   node engineering/scripts/check-upstream.mjs --json     # print the JSON result
//
// Exit codes: 0 = up to date or newer versions reported; 2 = check failed.
// A newer upstream version is information, not a failure.

import { execFile } from 'node:child_process';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const MANIFEST = join(ROOT, 'engineering/apps/desktop/package.json');
const STATE_DIR = join(ROOT, '.local/upstream');
const STATE_FILE = join(STATE_DIR, 'last-check.json');
const PACKAGE = '@deepseek-ai/dsh';
const REPO = 'deepseek-ai/deepseek-harness';
const TIMEOUT_MS = 15_000;

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};

function parseDuration(text) {
  const m = /^(\d+)([mhd])$/.exec(text ?? '');
  if (!m) throw new Error(`--max-age expects a value like 30m, 12h or 1d, got "${text}"`);
  return Number(m[1]) * { m: 60_000, h: 3_600_000, d: 86_400_000 }[m[2]];
}

/** SemVer 2.0 precedence for `x.y.z[-pre][+build]`; returns <0, 0 or >0. */
export function compareSemver(a, b) {
  const parse = (v) => {
    const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+.*)?$/.exec(v);
    if (!m) throw new Error(`not a SemVer version: ${v}`);
    return { core: m.slice(1, 4).map(Number), pre: m[4] ? m[4].split('.') : [] };
  };
  const x = parse(a);
  const y = parse(b);
  for (let i = 0; i < 3; i++) if (x.core[i] !== y.core[i]) return x.core[i] - y.core[i];
  if (!x.pre.length || !y.pre.length) return y.pre.length - x.pre.length;
  for (let i = 0; i < Math.max(x.pre.length, y.pre.length); i++) {
    const p = x.pre[i];
    const q = y.pre[i];
    if (p === undefined) return -1;
    if (q === undefined) return 1;
    if (p === q) continue;
    const pn = /^\d+$/.test(p);
    const qn = /^\d+$/.test(q);
    if (pn && qn) return Number(p) - Number(q);
    if (pn !== qn) return pn ? -1 : 1;
    return p < q ? -1 : 1;
  }
  return 0;
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  }
}

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

async function pinnedVersions() {
  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
  const deps = { ...manifest.dependencies, ...manifest.devDependencies };
  return Object.fromEntries(Object.entries(deps).filter(([name]) => name.startsWith('@deepseek-ai/')));
}

async function githubReleases(current) {
  try {
    const list = await fetchJson(`https://api.github.com/repos/${REPO}/releases?per_page=30`, {
      accept: 'application/vnd.github+json',
    });
    return list
      .filter((r) => !r.draft && /^dsh-v\d/.test(r.tag_name) && compareSemver(r.tag_name.slice(5), current) > 0)
      .map((r) => ({ tag: r.tag_name, prerelease: r.prerelease, publishedAt: r.published_at, url: r.html_url }));
  } catch (error) {
    // GitHub metadata only enriches the npm result; an unauthenticated rate limit must not fail the check.
    return { error: String(error.message ?? error) };
  }
}

async function check() {
  const pinned = await pinnedVersions();
  const current = pinned[PACKAGE];
  if (!current) throw new Error(`${MANIFEST} does not pin ${PACKAGE}`);
  const meta = await fetchJson(`https://registry.npmjs.org/${encodeURIComponent(PACKAGE)}`);
  const pinnedAt = meta.time?.[current];
  if (!pinnedAt) throw new Error(`npm has no publish time for ${PACKAGE}@${current}`);
  // Release lines are patched in parallel (0.1.5-rc.3 can ship after 0.1.6-alpha.2), so order by SemVer, not publish time.
  const newer = Object.keys(meta.versions ?? {})
    .filter((v) => compareSemver(v, current) > 0)
    .sort(compareSemver)
    .map((version) => ({ version, publishedAt: meta.time?.[version] ?? null }));
  const pinnedDist = meta.versions[current]?.dist ?? {};
  return {
    checkedAt: new Date().toISOString(),
    package: PACKAGE,
    pinned: { version: current, publishedAt: pinnedAt, siblings: pinned },
    distTags: meta['dist-tags'],
    newer,
    releases: await githubReleases(current),
    deprecated: meta.versions[current]?.deprecated ?? null,
    pinnedIntegrity: pinnedDist.integrity ?? null,
  };
}

function summary(r, cached) {
  const lines = [];
  const age = cached ? `（缓存，检查于 ${r.checkedAt}）` : `（检查于 ${r.checkedAt}）`;
  lines.push(`DSH 上游检查${age}`);
  lines.push(`- 当前锁定：${r.package}@${r.pinned.version}（发布于 ${r.pinned.publishedAt.slice(0, 10)}）`);
  lines.push(`- npm 渠道：${Object.entries(r.distTags).map(([k, v]) => `${k}=${v}`).join('，')}`);
  if (r.deprecated) lines.push(`- 警告：当前锁定版本已被标记弃用：${r.deprecated}`);
  if (r.newer.length === 0) {
    lines.push('- 结论：没有比锁定版本更新的发布。');
  } else {
    lines.push(`- 结论：有 ${r.newer.length} 个更新版本：${r.newer.map((n) => n.version).join('，')}`);
    if (Array.isArray(r.releases) && r.releases.length) {
      lines.push('- GitHub Release：');
      for (const rel of r.releases) lines.push(`  - ${rel.tag}${rel.prerelease ? '（预发布）' : ''} ${rel.url}`);
    } else if (r.releases?.error) {
      lines.push(`- GitHub Release 未取得：${r.releases.error}`);
    }
    lines.push('- 下一步：按 engineering/upstream.md「跟进流程」评估并在 upgrade/ 分支验证，不直接修改 main 的锁定版本。');
  }
  return lines.join('\n');
}

function notify(r, previous) {
  const latest = r.newer.at(-1)?.version;
  if (!latest || previous?.notifiedVersion === latest || process.platform !== 'darwin') return previous?.notifiedVersion;
  const text = `DSH ${latest} 已发布，当前锁定 ${r.pinned.version}`;
  execFile('osascript', ['-e', `display notification ${JSON.stringify(text)} with title "Focus Workspace 上游更新"`], () => {});
  return latest;
}

async function main() {
  const previous = await readJson(STATE_FILE);
  const maxAge = option('--max-age');
  if (maxAge && previous?.checkedAt && Date.now() - Date.parse(previous.checkedAt) < parseDuration(maxAge)) {
    const pinned = (await pinnedVersions())[PACKAGE];
    if (previous.pinned?.version === pinned) {
      console.log(flag('--json') ? JSON.stringify(previous, null, 2) : summary(previous, true));
      return;
    }
  }
  const result = await check();
  result.notifiedVersion = flag('--notify') ? notify(result, previous) : previous?.notifiedVersion;
  await mkdir(STATE_DIR, { recursive: true });
  await writeFile(`${STATE_FILE}.tmp`, `${JSON.stringify(result, null, 2)}\n`);
  await rename(`${STATE_FILE}.tmp`, STATE_FILE);
  console.log(flag('--json') ? JSON.stringify(result, null, 2) : summary(result, false));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`DSH 上游检查失败：${error.message ?? error}`);
    process.exitCode = 2;
  });
}
