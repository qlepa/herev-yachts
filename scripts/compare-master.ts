// Golden-HTML check for migration PRs (docs/testing-strategy.md §3 L3, §7):
// builds `master` and the working tree, then diffs the rendered HTML.
// Zero differences — or only the ones listed in the PR description.
//
//   pnpm compare:master            # compares against local `master`
//   pnpm compare:master origin/master
//
// The master build runs in a detached git worktree under tmp/ (gitignored)
// that shares node_modules through a junction; both builds force
// SANITY_PREVIEW=false. Takes two production builds (~3 min).

import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, symlinkSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { compareDist, report } from './compare-dist';

const ref = process.argv[2] ?? 'master';
const root = process.cwd();
const tmp = path.join(root, 'tmp', 'compare');
const masterDir = path.join(tmp, 'master');
const afterDir = path.join(tmp, 'after');
const env = { ...process.env, SANITY_PREVIEW: 'false' };
const run = (cmd: string, cwd = root) => execSync(cmd, { cwd, env, stdio: 'inherit' });

function cleanup() {
  if (existsSync(masterDir)) {
    try {
      execSync(`git worktree remove --force "${masterDir}"`, { cwd: root, stdio: 'ignore' });
    } catch {
      rmSync(masterDir, { recursive: true, force: true });
    }
  }
}

cleanup();
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

console.log(`\n▶ building working tree`);
run('pnpm build');
cpSync(path.join(root, 'dist', 'client'), afterDir, { recursive: true });

console.log(`\n▶ building ${ref}`);
run(`git worktree add --detach "${masterDir}" ${ref}`);
try {
  symlinkSync(path.join(root, 'node_modules'), path.join(masterDir, 'node_modules'), 'junction');
  if (existsSync(path.join(root, '.env'))) copyFileSync(path.join(root, '.env'), path.join(masterDir, '.env'));
  run('pnpm build', masterDir);

  const result = compareDist(path.join(masterDir, 'dist', 'client'), afterDir);
  console.log(`\n▶ ${ref} → working tree\n${report(result)}`);
  process.exitCode = result.differences.length ? 1 : 0;
} finally {
  cleanup();
}
