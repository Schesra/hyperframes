import { describe, expect, it } from "vitest";
import { filterByUsage, countUsage } from "./AssetsTab";

const assets = ["bgm.mp3", "logo.png", "orphan.wav"];
const used = new Set(["bgm.mp3", "logo.png"]);

describe("filterByUsage", () => {
  it("returns everything for 'all'", () => {
    expect(filterByUsage(assets, used, "all")).toEqual(assets);
  });

  it("keeps only referenced assets for 'used'", () => {
    expect(filterByUsage(assets, used, "used")).toEqual(["bgm.mp3", "logo.png"]);
  });

  it("keeps only unreferenced assets for 'unused'", () => {
    expect(filterByUsage(assets, used, "unused")).toEqual(["orphan.wav"]);
  });

  it("treats everything as unused when nothing is referenced", () => {
    expect(filterByUsage(assets, new Set(), "used")).toEqual([]);
    expect(filterByUsage(assets, new Set(), "unused")).toEqual(assets);
  });
});

describe("countUsage", () => {
  it("counts used vs unused", () => {
    expect(countUsage(assets, used)).toEqual({ used: 2, unused: 1 });
  });

  it("is all-unused with an empty used set", () => {
    expect(countUsage(assets, new Set())).toEqual({ used: 0, unused: 3 });
  });
});
