// `pnpm install` → git runs the hooks in .githooks/ (pre-commit: unit tests
// of the changed files; pre-push: `pnpm verify`). Silent where there is no
// repository (Vercel build) — CI is the real gate anyway.
import { execFileSync } from 'node:child_process';

try {
  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'ignore' });
} catch {
  // not a git checkout
}
