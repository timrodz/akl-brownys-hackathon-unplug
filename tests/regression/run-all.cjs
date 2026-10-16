/**
 * Run every check-*.cjs regression from the repository root (required for app/lib paths).
 * Usage: node tests/regression/run-all.cjs
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const regressionDir = __dirname;
const repoRoot = path.join(regressionDir, "../..");
const checks = fs
  .readdirSync(regressionDir)
  .filter((name) => name.startsWith("check-") && name.endsWith(".cjs"))
  .sort();

let failed = false;
for (const name of checks) {
  console.log(`\n--- ${name} ---`);
  const scriptPath = path.join(regressionDir, name);
  // Bun resolves @/ imports when loading app TypeScript from this check.
  const useBun = name === "check-distance-ranking.cjs";
  const command = useBun ? "bun" : process.execPath;
  const args = useBun ? [scriptPath] : [scriptPath];
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
  });
  if (result.status !== 0) failed = true;
}

if (failed) process.exit(1);
