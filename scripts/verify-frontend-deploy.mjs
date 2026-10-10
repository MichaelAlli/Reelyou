#!/usr/bin/env node
/**
 * Compare live static web deploy vs local git HEAD (bundle hash + optional build-meta.json).
 * Usage: node scripts/verify-frontend-deploy.mjs [WEB_ORIGIN]
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const origin = (process.argv[2]?.trim() || 'https://reelyou.onrender.com').replace(/\/$/, '');
const localHead = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();

async function main() {
  const welcomeRes = await fetch(`${origin}/welcome`);
  const html = await welcomeRes.text();
  const entryMatch = html.match(/entry-([a-f0-9]+)\.js/);
  const liveEntry = entryMatch?.[1] ?? null;

  let meta = null;
  try {
    const metaRes = await fetch(`${origin}/build-meta.json`);
    if (metaRes.ok) meta = await metaRes.json();
  } catch {
    meta = null;
  }

  let localEntry = null;
  const welcomeHtml = join(process.cwd(), 'dist/welcome.html');
  if (existsSync(welcomeHtml)) {
    const local = readFileSync(welcomeHtml, 'utf8');
    localEntry = local.match(/entry-([a-f0-9]+)\.js/)?.[1] ?? null;
  }

  const report = {
    webOrigin: origin,
    localGitHead: localHead,
    liveEntryHash: liveEntry,
    localExportEntryHash: localEntry,
    bundleMatchesLocalExport: liveEntry != null && localEntry != null && liveEntry === localEntry,
    liveBuildMeta: meta,
    liveCommitMatchesHead: meta?.commit === localHead,
  };

  console.log(JSON.stringify(report, null, 2));

  if (meta?.commit) {
    process.exit(meta.commit === localHead ? 0 : 1);
  }
  process.exit(report.bundleMatchesLocalExport ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
