// Machine-capability probe for the spec-gated local-model fallback.
//
// Local models are USER-INSTALLED and local-use-only — media-use recommends,
// spec-checks, and assists install, but never bundles or runs them as a service.
// This probe answers "what tier can this machine actually run?" so selection can
// offer a medium/large local model, or fall back to recommending the CLI path.
//
// `osMod` and `exec` are injectable for tests. `exec(cmd)` returns the command's
// stdout as a string, or throws / returns null on failure.

import os from "node:os";
import { execSync } from "node:child_process";

function defaultExec(cmd) {
  return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 4000 });
}

function detectGpu(platform, arch, ramMB, exec) {
  // Apple Silicon: Metal GPU with unified memory — VRAM tracks system RAM.
  if (platform === "darwin" && arch === "arm64") {
    return { present: true, kind: "apple", vramMB: ramMB };
  }
  // NVIDIA: query total VRAM. Any failure (no driver, no GPU) -> no GPU.
  try {
    const out = exec("nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits");
    const mb = parseInt(String(out).trim().split(/\r?\n/)[0], 10);
    if (Number.isFinite(mb) && mb > 0) return { present: true, kind: "nvidia", vramMB: mb };
  } catch {
    // fall through — no usable GPU
  }
  return { present: false, kind: null, vramMB: 0 };
}

export function probeSpecs({ osMod = os, exec = defaultExec } = {}) {
  const platform = osMod.platform();
  const arch = osMod.arch();
  const cpuCores = osMod.cpus().length;
  const ramMB = Math.round(osMod.totalmem() / (1024 * 1024));
  return {
    platform,
    arch,
    cpuCores,
    ramMB,
    appleSilicon: platform === "darwin" && arch === "arm64",
    gpu: detectGpu(platform, arch, ramMB, exec),
  };
}
