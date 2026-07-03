import { describe, expect, it } from "vitest";
import { countRepeatedAtFlag } from "./snapshot.js";

describe("countRepeatedAtFlag", () => {
  it("returns 0 when --at is absent", () => {
    expect(countRepeatedAtFlag(["node", "cli.js", "snapshot"])).toBe(0);
  });

  it("returns 1 for a single --at usage", () => {
    expect(countRepeatedAtFlag(["snapshot", "--at", "1,2,3"])).toBe(1);
  });

  it("returns 1 for a single --at=value usage", () => {
    expect(countRepeatedAtFlag(["snapshot", "--at=1,2,3"])).toBe(1);
  });

  it("counts repeated --at occurrences (the actual bug shape)", () => {
    expect(countRepeatedAtFlag(["snapshot", "--at", "1", "--at", "2", "--at", "3"])).toBe(3);
  });

  it("counts a mix of --at and --at= forms", () => {
    expect(countRepeatedAtFlag(["snapshot", "--at", "1", "--at=2"])).toBe(2);
  });

  it("does not confuse an unrelated flag that merely starts with --at", () => {
    expect(countRepeatedAtFlag(["snapshot", "--attempt", "1", "--attempt", "2"])).toBe(0);
  });
});
