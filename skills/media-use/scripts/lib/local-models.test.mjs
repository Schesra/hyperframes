import { strict as assert } from "node:assert";
import { test } from "node:test";
import { listModels, meetsSpecs, selectModel, CAPABILITIES } from "./local-models.mjs";

const strongGpu = {
  ramMB: 64000,
  gpu: { present: true, kind: "nvidia", vramMB: 24000 },
  appleSilicon: false,
};
const cpuOnly = { ramMB: 16000, gpu: { present: false, vramMB: 0 }, appleSilicon: false };
const tiny = { ramMB: 1024, gpu: { present: false, vramMB: 0 }, appleSilicon: false };

test("every capability table is non-empty and well-formed", () => {
  for (const cap of CAPABILITIES) {
    const models = listModels(cap);
    assert.ok(models.length > 0, `no models for ${cap}`);
    for (const m of models) {
      assert.ok(m.id && m.tier && m.needs, `${cap}/${m.id} missing fields`);
      assert.ok(["medium", "large"].includes(m.tier), `${cap}/${m.id} bad tier`);
      assert.equal(typeof m.install, "string", `${cap}/${m.id} needs an install command`);
      assert.equal(typeof m.invoke, "string", `${cap}/${m.id} needs an invoke command`);
      // user-installed, local-use-only: there is NO license gate on selection
      assert.equal("license" in m, false, `${cap}/${m.id} must not carry a license gate`);
    }
  }
});

test("meetsSpecs enforces RAM, GPU presence, and VRAM", () => {
  const gpuModel = { needs: { ramMB: 8000, gpu: true, vramMB: 12000 } };
  assert.equal(meetsSpecs(gpuModel, strongGpu), true);
  assert.equal(meetsSpecs(gpuModel, cpuOnly), false, "no GPU -> fails a GPU model");
  const cpuModel = { needs: { ramMB: 2000, gpu: false } };
  assert.equal(meetsSpecs(cpuModel, cpuOnly), true);
  assert.equal(meetsSpecs(cpuModel, tiny), false, "too little RAM");
});

test("Apple Silicon unified memory counts as VRAM", () => {
  const apple = {
    ramMB: 24000,
    appleSilicon: true,
    gpu: { present: true, kind: "apple", vramMB: 24000 },
  };
  const gpuModel = { needs: { ramMB: 8000, gpu: true, vramMB: 16000 } };
  assert.equal(meetsSpecs(gpuModel, apple), true);
});

test("selectModel picks the large tier on a strong machine", () => {
  const r = selectModel("tts", strongGpu);
  assert.equal(r.tier, "large");
  assert.ok(r.model.id);
});

test("selectModel falls back to medium on a CPU-only machine", () => {
  const r = selectModel("tts", cpuOnly);
  assert.equal(r.tier, "medium");
  assert.equal(r.model.id, "kokoro", "Kokoro is the CPU/medium default (native word timestamps)");
});

test("selectModel recommends the CLI path when no tier fits", () => {
  const r = selectModel("tts", tiny);
  assert.equal(r.recommend, "cli");
  assert.ok(r.reason && /spec/i.test(r.reason));
  assert.equal(r.model, undefined);
});

test("preferTier:'medium' avoids the large model even on a strong machine", () => {
  const r = selectModel("tts", strongGpu, { preferTier: "medium" });
  assert.equal(r.tier, "medium");
});

test("ASR offers word-timestamp-capable models (better than plain whisper)", () => {
  const asr = listModels("asr");
  assert.ok(
    asr.every((m) => m.wordTimestamps),
    "every ASR model must support word timestamps",
  );
});
