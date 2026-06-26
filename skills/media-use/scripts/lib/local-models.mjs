// Declarative table of USER-INSTALLED local models, for the spec-gated fallback.
//
// These models run on the user's own machine for their own use — media-use
// recommends, spec-checks, and assists install; it does not bundle, redistribute,
// or sell them. Because nothing is redistributed, selection is purely by
// quality / size / spec-fit / word-timestamp support — there is deliberately NO
// license field gating availability.
//
// Tiers: `medium` = broad-compat, smaller (auto-install target ~<=2 GB);
// `large` = best quality, needs a strong machine. selectModel() picks the
// highest tier the machine can run, or returns a recommend-the-CLI result.
//
// Picks reflect the 2026 research pass (see the v2 plan). The large-tier TTS
// default (fish-speech) is the meeting's pick; final defaults are confirmed by
// the eval harness in U7 — this table is the shortlist + current default.

export const CAPABILITIES = ["tts", "asr", "upscale"];

const MODELS = {
  tts: [
    {
      id: "kokoro",
      tier: "medium",
      sizeMB: 330,
      needs: { ramMB: 2048, gpu: false },
      wordTimestamps: "native",
      install: "pip install kokoro",
      invoke: "python -m kokoro --text {text} --voice {voice} --out {out}",
      notes: "CPU, faster-than-realtime, native per-word timestamps. Default floor.",
    },
    {
      id: "fish-speech",
      tier: "large",
      sizeMB: 1100,
      needs: { ramMB: 16000, gpu: true, vramMB: 12000 },
      wordTimestamps: "whisperx", // needs forced alignment (run ASR over output)
      install: "pip install fish-speech",
      invoke: "fish-speech synth --text {text} --ref {ref} --out {out}",
      notes: "Expressive zero-shot voice cloning; meeting pick. WhisperX for word timing.",
    },
  ],
  asr: [
    {
      id: "whisperx",
      tier: "medium",
      sizeMB: 1500,
      needs: { ramMB: 4096, gpu: false },
      wordTimestamps: "native", // faster-whisper + wav2vec2 forced alignment
      install: "pip install whisperx",
      invoke: "whisperx {audio} --output_format json --out {out}",
      notes: "Sub-100ms word timestamps on CPU. Strict upgrade over plain whisper.",
    },
    {
      id: "parakeet",
      tier: "large",
      sizeMB: 2400,
      needs: { ramMB: 8000, gpu: true, vramMB: 4000 },
      wordTimestamps: "native",
      install: "pip install parakeet-mlx  # NVIDIA: nemo-toolkit[asr]",
      invoke: "parakeet {audio} --timestamps word --out {out}",
      notes: "~1000x realtime; native word timestamps. Apple Silicon via parakeet-mlx.",
    },
  ],
  upscale: [
    {
      id: "real-esrgan",
      tier: "medium",
      sizeMB: 70,
      needs: { ramMB: 2048, gpu: false },
      wordTimestamps: false,
      install: "brew install real-esrgan-ncnn-vulkan  # or download the ncnn binary",
      invoke: "realesrgan-ncnn-vulkan -i {in} -o {out} -s 4",
      notes: "ncnn-vulkan binary, CPU-capable. GFPGAN for faces.",
    },
    {
      id: "seedvr2",
      tier: "large",
      sizeMB: 6000,
      needs: { ramMB: 24000, gpu: true, vramMB: 16000 },
      wordTimestamps: false,
      install: "pip install seedvr2",
      invoke: "seedvr2 upscale --in {in} --out {out}",
      notes: "Diffusion upscaler, GPU-only. Video2X for video.",
    },
  ],
};

function tableFor(capability) {
  const t = MODELS[capability];
  if (!t) throw new Error(`unknown local-model capability: ${capability}`);
  return t;
}

/** All local models for a capability. */
export function listModels(capability) {
  return tableFor(capability).slice();
}

/** Does this machine meet a model's needs? Apple Silicon unified memory counts as VRAM. */
export function meetsSpecs(model, specs) {
  const n = model.needs || {};
  if (n.ramMB && specs.ramMB < n.ramMB) return false;
  if (n.gpu && !specs.gpu?.present) return false;
  if (n.vramMB) {
    const vram = specs.gpu?.vramMB ?? 0;
    if (vram < n.vramMB) return false;
  }
  return true;
}

/**
 * Pick the best local model the machine can run for a capability.
 * Prefers `large` unless preferTier pins `medium`. Returns
 * `{ model, tier }`, or `{ recommend: "cli", reason }` when nothing fits.
 */
export function selectModel(capability, specs, { preferTier } = {}) {
  const table = tableFor(capability);
  const order = preferTier === "medium" ? ["medium"] : ["large", "medium"];
  for (const tier of order) {
    const model = table.find((m) => m.tier === tier && meetsSpecs(m, specs));
    if (model) return { model, tier };
  }
  const smallest = table.reduce((a, b) => (a.sizeMB <= b.sizeMB ? a : b));
  return {
    recommend: "cli",
    reason: `machine does not meet specs for any local ${capability} model (smallest needs ~${smallest.needs.ramMB}MB RAM${smallest.needs.gpu ? " + GPU" : ""}); use the CLI path instead`,
  };
}
