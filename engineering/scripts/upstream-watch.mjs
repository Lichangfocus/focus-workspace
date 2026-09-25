#!/usr/bin/env node
// Installs, removes or inspects the daily macOS launchd job that runs
// check-upstream.mjs --notify. launchd (not crontab) runs a missed calendar
// slot after the Mac wakes, so a sleeping laptop still gets one check per day.
//
// Usage:
//   node engineering/scripts/upstream-watch.mjs install [--hour 9] [--minute 30]
//   node engineering/scripts/upstream-watch.mjs uninstall
//   node engineering/scripts/upstream-watch.mjs status
//
// The generated plist embeds the absolute paths of the current Node binary and
// of this checkout; rerun `install` after moving the repository or changing Node.

import { execFileSync } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const LABEL = 'io.github.lichangfocus.focus-workspace.upstream-check';
const PLIST = join(homedir(), 'Library/LaunchAgents', `${LABEL}.plist`);
const LOG = join(ROOT, '.local/upstream/launchd.log');
const DOMAIN = `gui/${process.getuid()}`;

const [command, ...rest] = process.argv.slice(2);
const option = (name, fallback) => {
  const i = rest.indexOf(name);
  return i === -1 ? fallback : Number(rest[i + 1]);
};

const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function plist(hour, minute) {
  const argv = [process.execPath, join(ROOT, 'engineering/scripts/check-upstream.mjs'), '--notify'];
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
${argv.map((a) => `    <string>${escapeXml(a)}</string>`).join('\n')}
  </array>
  <key>WorkingDirectory</key><string>${escapeXml(ROOT)}</string>
  <key>StartCalendarInterval</key>
  <dict><key>Hour</key><integer>${hour}</integer><key>Minute</key><integer>${minute}</integer></dict>
  <key>StandardOutPath</key><string>${escapeXml(LOG)}</string>
  <key>StandardErrorPath</key><string>${escapeXml(LOG)}</string>
</dict>
</plist>
`;
}

function launchctl(...argv) {
  return execFileSync('launchctl', argv, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function bootout() {
  try {
    launchctl('bootout', `${DOMAIN}/${LABEL}`);
  } catch (error) {
    // launchctl exits non-zero when the job is not loaded, which is the expected state on first install.
    void error;
  }
}

async function main() {
  if (process.platform !== 'darwin') throw new Error('upstream-watch uses launchd and supports macOS only');
  switch (command) {
    case 'install': {
      const hour = option('--hour', 9);
      const minute = option('--minute', 30);
      if (!(hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59)) throw new Error('--hour 0-23, --minute 0-59');
      await mkdir(dirname(PLIST), { recursive: true });
      await mkdir(dirname(LOG), { recursive: true });
      await writeFile(PLIST, plist(hour, minute));
      bootout();
      launchctl('bootstrap', DOMAIN, PLIST);
      console.log(`已安装每日 ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} 的上游检查：${PLIST}`);
      console.log(`日志：${LOG}`);
      break;
    }
    case 'uninstall':
      bootout();
      await rm(PLIST, { force: true });
      console.log(`已移除 ${LABEL}`);
      break;
    case 'status':
      try {
        const out = launchctl('print', `${DOMAIN}/${LABEL}`);
        const pick = (key) => out.match(new RegExp(`\\n\\s*${key} = (.*)`))?.[1] ?? '未知';
        console.log(`已加载：${LABEL}\n状态：${pick('state')}\n上次退出：${pick('last exit code')}\n日志：${LOG}`);
      } catch (error) {
        console.log(`未加载：${LABEL}（${error.stderr?.trim() || error.message}）`);
        process.exitCode = 1;
      }
      break;
    default:
      console.error('用法：upstream-watch.mjs install|uninstall|status [--hour H] [--minute M]');
      process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exitCode = 2;
});
