import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("architecture boundary enforcement", () => {
  it("rejects a capability importing a concrete adapter", () => {
    let failed = false;
    let combinedOutput = "";

    try {
      combinedOutput = execSync(
        "npx depcruise src/capabilities/__boundary-fixtures__/illegal-imports-adapter.ts --config .dependency-cruiser.fixture.cjs",
        { encoding: "utf-8", stdio: "pipe" },
      );
    } catch (error: unknown) {
      failed = true;
      const err = error as { stdout?: string; stderr?: string; status?: number };
      combinedOutput = `${err.stdout ?? ""}${err.stderr ?? ""}`;
      expect(err.status).not.toBe(0);
    }

    expect(failed).toBe(true);
    expect(combinedOutput).toMatch(/capabilities-no-adapters|not allowed/i);
  });
});
