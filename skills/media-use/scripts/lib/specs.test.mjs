import { strict as assert } from "node:assert";
import { test } from "node:test";
import { probeSpecs } from "./specs.mjs";

// Fake os module + exec so the probe is deterministic across CI machines.
const fakeOs = (over = {}) => ({
  platform: () => over.platform ?? "linux",
  arch: () => over.arch ?? "x64",
  cpus: () => Array.from({ length: over.cores ?? 8 }),
  totalmem: () => (over.ramMB ?? 16384) * 1024 * 1024,
});

test("probeSpecs reports structured caps", () => {
  const s = probeSpecs({ osMod: fakeOs({ cores: 12, ramMB: 32768 }), exec: () => null });
  assert.equal(s.cpuCores, 12);
  assert.equal(s.ramMB, 32768);
  assert.equal(s.platform, "linux");
  assert.equal(s.gpu.present, false);
});

test("Apple Silicon is detected as a unified-memory GPU", () => {
  const s = probeSpecs({
    osMod: fakeOs({ platform: "darwin", arch: "arm64", ramMB: 24576 }),
    exec: () => null,
  });
  assert.equal(s.appleSilicon, true);
  assert.equal(s.gpu.present, true);
  assert.equal(s.gpu.kind, "apple");
  // unified memory: VRAM tracks system RAM
  assert.equal(s.gpu.vramMB, 24576);
});

test("NVIDIA GPU is detected via nvidia-smi VRAM query", () => {
  const exec = (cmd) => (cmd.includes("nvidia-smi") ? "24564" : null);
  const s = probeSpecs({ osMod: fakeOs({ platform: "linux" }), exec });
  assert.equal(s.gpu.present, true);
  assert.equal(s.gpu.kind, "nvidia");
  assert.equal(s.gpu.vramMB, 24564);
});

test("no GPU when nvidia-smi is absent / fails", () => {
  const s = probeSpecs({
    osMod: fakeOs({ platform: "linux" }),
    exec: () => {
      throw new Error("command not found");
    },
  });
  assert.equal(s.gpu.present, false);
  assert.equal(s.gpu.vramMB, 0);
});
