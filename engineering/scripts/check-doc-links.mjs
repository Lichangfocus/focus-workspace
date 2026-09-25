#!/usr/bin/env node
// Checks every relative Markdown link in tracked and untracked (non-ignored)
// files: the target file must exist and, when a #fragment is given, the target
// must contain a heading whose GitHub-style anchor matches.
//
// Usage: node engineering/scripts/check-doc-links.mjs   (exit 1 on broken links)

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** GitHub heading anchor: lowercase, drop punctuation except `-`/`_`, spaces to `-`. */
export function githubAnchor(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\p{Mark}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

function anchorsOf(file) {
  const seen = new Map();
  const anchors = new Set();
  let fenced = false;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (/^\s*```/.test(line)) fenced = !fenced;
    const m = !fenced && /^#{1,6}\s+(.*?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const base = githubAnchor(m[1].replace(/`/g, ''));
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    anchors.add(n ? `${base}-${n}` : base);
  }
  return anchors;
}

function main() {
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '*.md'], {
    cwd: ROOT,
    encoding: 'utf8',
  })
    .split('\n')
    .filter((f) => f && existsSync(join(ROOT, f)));
  const broken = [];
  const cache = new Map();
  for (const file of files) {
    const text = readFileSync(join(ROOT, file), 'utf8').replace(/```[\s\S]*?```/g, '');
    for (const [, url] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^[a-z]+:/i.test(url)) continue;
      const [path, fragment] = url.split('#');
      const target = path ? normalize(join(dirname(join(ROOT, file)), decodeURI(path))) : join(ROOT, file);
      if (!existsSync(target)) {
        broken.push(`${file}: ${url} (missing file)`);
        continue;
      }
      if (fragment && target.endsWith('.md')) {
        if (!cache.has(target)) cache.set(target, anchorsOf(target));
        if (!cache.get(target).has(decodeURI(fragment))) broken.push(`${file}: ${url} (missing anchor in ${relative(ROOT, target)})`);
      }
    }
  }
  if (broken.length) {
    console.error(`${broken.length} broken link(s):\n${broken.join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log(`All relative links OK in ${files.length} Markdown files.`);
  }
}

main();
