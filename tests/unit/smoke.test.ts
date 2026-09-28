import { describe, expect, it } from "vitest";
import { RunKindSchema } from "../../src/model/run.js";

describe("toolchain smoke", () => {
  it("parses a run kind with zod", () => {
    expect(RunKindSchema.parse("DISCOVERY")).toBe("DISCOVERY");
  });
});
