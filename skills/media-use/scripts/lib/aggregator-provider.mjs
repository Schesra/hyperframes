import { execFileSync } from "node:child_process";

// fal aggregator (genmedia CLI). Default-OFF in the registry (B-Q2); enable with
// MEDIA_USE_ENABLE_FAL=1 once Bin approves bundling third-party cloud CLIs.
// Mirrors the heygen-search execFile pattern (argv array, no shell).
//
// ponytail: exact fal CLI flags/JSON shape are per fal's genmedia docs, not
// verified here (CLI not installed). Confirm the model ids + output keys against
// `fal run --help` when the flag is first flipped on. The wiring is the point.

const MODEL = { image: "fal-ai/flux/schnell", bgm: "fal-ai/minimax-music", sfx: "fal-ai/mmaudio" };

export function falGenerate(kind) {
  return async function generate(intent) {
    const model = MODEL[kind];
    if (!model) return null;
    let out;
    try {
      out = execFileSync("fal", ["run", model, "--input", JSON.stringify({ prompt: intent })], {
        encoding: "utf8",
        timeout: 120000,
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch (err) {
      const detail = err.stderr?.toString().trim() || err.message;
      console.error(`media-use: \`fal run ${model}\` failed: ${detail}`);
      return null;
    }
    let parsed;
    try {
      parsed = JSON.parse(out);
    } catch {
      return null;
    }
    const url = parsed?.url || parsed?.images?.[0]?.url || parsed?.audio?.url || parsed?.video?.url;
    if (!url) return null;
    return {
      url,
      source: "generated",
      metadata: { description: intent, provider: "fal", provenance: { model, prompt: intent } },
    };
  };
}
