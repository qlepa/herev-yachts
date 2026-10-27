// Everything that must be green before a push (CLAUDE.md "NEVER" +
// docs/testing-strategy.md §6). Forces the production variant of the build
// regardless of the local `.env` (which has SANITY_PREVIEW=true on dev machines).
//
//   pnpm verify

import { execSync } from 'node:child_process';

const steps: Array<{ label: string; command: string; env?: NodeJS.ProcessEnv }> = [
  { label: 'typecheck', command: 'pnpm typecheck' },
  { label: 'unit tests', command: 'pnpm test:unit' },
  { label: 'production build', command: 'pnpm build', env: { SANITY_PREVIEW: 'false' } },
  { label: 'dist tests', command: 'pnpm test:dist' },
];

for (const step of steps) {
  console.log(`\n▶ ${step.label}`);
  try {
    execSync(step.command, { stdio: 'inherit', env: { ...process.env, ...step.env } });
  } catch {
    console.error(`\n✖ ${step.label} failed — not safe to push`);
    process.exit(1);
  }
}
console.log('\n✔ verify: all green');
