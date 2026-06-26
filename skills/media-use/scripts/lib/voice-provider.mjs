import { execFileSync } from "node:child_process";

// Voice/TTS generation. Default-OFF (B-Q1); enable once Bin approves voiceover:
//   ElevenLabs CLI -> MEDIA_USE_ENABLE_ELEVENLABS=1
//   HeyGen TTS     -> MEDIA_USE_ENABLE_HEYGEN_TTS=1
// Both shell their own CLI (CLI-only invariant: media-use holds no keys).
//
// ponytail: exact CLI flags/output aren't verified here (CLIs not installed).
// Confirm against each CLI's --help when first flipped on. Wiring is the point.

function runJson(bin, argv) {
  let out;
  try {
    out = execFileSync(bin, argv, {
      encoding: "utf8",
      timeout: 120000,
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (err) {
    console.error(
      `media-use: \`${bin}\` tts failed: ${err.stderr?.toString().trim() || err.message}`,
    );
    return null;
  }
  try {
    return JSON.parse(out);
  } catch {
    return null;
  }
}

function result(url, provider, intent) {
  if (!url) return null;
  return {
    url,
    source: "generated",
    metadata: { description: intent, provider, provenance: { prompt: intent } },
  };
}

export async function elevenlabsGenerate(intent) {
  const p = runJson("elevenlabs", ["tts", "--text", intent, "--json"]);
  return result(p?.url || p?.audio_url, "elevenlabs", intent);
}

export async function heygenTtsGenerate(intent) {
  const p = runJson("heygen", ["voice", "tts", "--text", intent]);
  return result(p?.data?.audio_url || p?.audio_url, "heygen.tts", intent);
}
