import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Repo root (parent of `scripts/`), not the shell cwd. */
export const projectRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

function applyEnvFile(filePath: string, override: boolean) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  for (const line of content.split("\n")) {
    let trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    if (trimmed.startsWith("export ")) {
      trimmed = trimmed.slice("export ".length).trim();
    }

    const equalsAt = trimmed.indexOf("=");
    if (equalsAt === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsAt).trim();
    let value = trimmed.slice(equalsAt + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (override || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

/** Load `.env` then `.env.local` (local overrides) for CLI scripts and drizzle-kit. */
export function loadProjectEnv(): void {
  applyEnvFile(resolve(projectRoot, ".env"), false);
  applyEnvFile(resolve(projectRoot, ".env.local"), true);
}

export function projectEnvFilePaths(): { env: string; local: string } {
  return {
    env: resolve(projectRoot, ".env"),
    local: resolve(projectRoot, ".env.local"),
  };
}
