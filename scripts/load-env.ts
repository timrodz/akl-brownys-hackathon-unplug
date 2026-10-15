import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function applyEnvFile(filePath: string, override: boolean) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
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
  const root = process.cwd();
  applyEnvFile(resolve(root, ".env"), false);
  applyEnvFile(resolve(root, ".env.local"), true);
}
