#!/usr/bin/env node
/**
 * Render Static Site build — produces `dist/` for https://reelyou.onrender.com
 *
 * Set BUILD env vars from `.env.production.example` on the Render static service.
 * Publish directory: dist
 */
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function resolveGitCommit() {
  return (
    process.env.RENDER_GIT_COMMIT?.trim() ||
    process.env.BUILD_COMMIT?.trim() ||
    execSync('git rev-parse HEAD', { cwd: root, encoding: 'utf8' }).trim()
  );
}

console.log('[render-static-build] expo export -p web');
execSync('npx expo export -p web', { cwd: root, stdio: 'inherit' });

const commit = resolveGitCommit();
const meta = {
  service: 'reelyou-web',
  commit,
  builtAt: new Date().toISOString(),
  branch: process.env.RENDER_GIT_BRANCH?.trim() || process.env.GIT_BRANCH?.trim() || null,
};

const distDir = join(root, 'dist');
mkdirSync(distDir, { recursive: true });
writeFileSync(join(distDir, 'build-meta.json'), `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
console.log('[render-static-build] wrote dist/build-meta.json', meta);
