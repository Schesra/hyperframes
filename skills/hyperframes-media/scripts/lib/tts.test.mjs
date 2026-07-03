import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { synthesizeOne } from "./tts.mjs";

// Regression: synthesizeHeygen used to collapse every failure (a real HTTP
// error from HeyGen, a missing audio_url, a failed transcode) into a bare
// { ok: false }, so callers could never tell a 402 plan-upgrade response
// from a transient 500 or a local ffmpeg problem. heygenJSON already throws
// a message carrying the HTTP status and response body — the fix is just to
// stop swallowing it. Exercised via the real synthesizeOne() -> heygenJSON()
// -> global fetch() path (heygenJSON has no seam to mock other than fetch
// itself, which is a real global here, not a per-module import).
test("synthesizeOne surfaces the real HeyGen HTTP error instead of a bare ok:false", async () => {
  const dir = mkdtempSync(join(tmpdir(), "heygen-tts-error-"));
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.HEYGEN_API_KEY;
  try {
    process.env.HEYGEN_API_KEY = "fake-key-for-test";
    globalThis.fetch = async () => ({
      ok: false,
      status: 402,
      text: async () => JSON.stringify({ error: "plan_upgrade_required" }),
    });

    const result = await synthesizeOne({
      provider: "heygen",
      text: "hello",
      voiceId: "some-voice",
      wavAbs: join(dir, "out.wav"),
      hyperframesDir: dir,
    });

    assert.equal(result.ok, false);
    assert.match(result.error, /HTTP 402/);
    assert.match(result.error, /plan_upgrade_required/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.HEYGEN_API_KEY;
    else process.env.HEYGEN_API_KEY = originalApiKey;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("synthesizeOne reports a missing audio_url distinctly from an HTTP error", async () => {
  const dir = mkdtempSync(join(tmpdir(), "heygen-tts-no-url-"));
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.HEYGEN_API_KEY;
  try {
    process.env.HEYGEN_API_KEY = "fake-key-for-test";
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ data: {} }),
    });

    const result = await synthesizeOne({
      provider: "heygen",
      text: "hello",
      voiceId: "some-voice",
      wavAbs: join(dir, "out.wav"),
      hyperframesDir: dir,
    });

    assert.equal(result.ok, false);
    assert.match(result.error, /no audio_url/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.HEYGEN_API_KEY;
    else process.env.HEYGEN_API_KEY = originalApiKey;
    rmSync(dir, { recursive: true, force: true });
  }
});
