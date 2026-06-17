// prep.mjs concern module — resolve the scene SFX cues into globally timed sfx records.
//
// SFX SOURCE is media-use (heygen audio catalog PREFERRED → the static SFX library as fallback):
// this hands the cues to media-use `scripts/audio/sfx.mjs`, which freezes each needed clip into
// <PROJECT_DIR>/assets/sfx/ (a heygen-catalog clip when one fits, else the library file) and
// registers it in the one .media/ ledger, returning each clip's REAL duration. The cue TIMING
// (scene.start_s + t_local) stays here. Without --sfx-lib the cues are dropped (warning only).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

// media-use lives at skills/media-use; this file is skills/<skill>/scripts/lib/prep-sfx.mjs.
const mediaUseDir =
  process.env.MEDIA_USE_DIR || join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "media-use");

export function resolveSfx({ sfxLibDir, hyperframesDir, scenes, groups, anomalies }) {
  const sfx = [];

  // Gather every scene's cues in render order, carrying the scene start for global timing.
  const cues = [];
  for (const g of groups) {
    for (const sid of g.scene_ids) {
      const sceneEntry = g.scenes[sid];
      const sceneCues = scenes.find((x) => x.sceneId === sid)?.sfxCues || [];
      for (const cue of sceneCues) cues.push({ ...cue, sceneId: sid, start_s: sceneEntry.start_s });
    }
  }
  if (cues.length === 0) return sfx;

  if (!sfxLibDir) {
    anomalies.push(`section_plan declares ${cues.length} SFX cue(s) but --sfx-lib not passed — all cues dropped`);
    return sfx;
  }

  // Source via media-use (heygen-preferred). It freezes the used clips into assets/sfx/ + registers
  // them, and returns { resolved: [{ file, duration, provider }] } — the real (catalog or library) durations.
  const durByFile = new Map();
  const sfxCli = join(mediaUseDir, "scripts", "audio", "sfx.mjs");
  if (existsSync(sfxCli)) {
    const cuesPath = join(hyperframesDir, ".media", "sfx-cues.json");
    mkdirSync(dirname(cuesPath), { recursive: true });
    writeFileSync(cuesPath, JSON.stringify({ sfx: cues.map((c) => ({ file: c.file, note: c.note })) }));
    const r = spawnSync(
      "node",
      [sfxCli, "--project", hyperframesDir, "--cues", cuesPath, "--sfx-lib", sfxLibDir, "--register"],
      { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
    );
    try {
      const o = JSON.parse((r.stdout || "").trim());
      for (const res of o.resolved || []) if (res.file) durByFile.set(res.file, res.duration);
      console.log(`  sfx via media-use (${o.source || "?"}): ${o.copied || 0} clip(s) → assets/sfx/`);
    } catch (e) {
      anomalies.push(`media-use sfx.mjs failed (${(r.stderr || e.message || "").toString().slice(0, 120)}) — using library durations`);
    }
  } else {
    anomalies.push(`media-use not found at ${mediaUseDir} — using library durations (no heygen SFX)`);
  }

  // Library manifest = duration source for any cue media-use didn't resolve (and the no-media-use path).
  let manifest = {};
  const manifestPath = join(sfxLibDir, "manifest.json");
  if (existsSync(manifestPath)) {
    try { manifest = JSON.parse(readFileSync(manifestPath, "utf8")); } catch { /* fall through */ }
  }
  const libDur = new Map();
  for (const e of Object.values(manifest)) if (e?.file && isFinite(e.duration)) libDur.set(e.file, e.duration);

  for (const cue of cues) {
    const duration = durByFile.has(cue.file) ? durByFile.get(cue.file) : libDur.get(cue.file);
    if (duration == null) {
      anomalies.push(`${cue.sceneId}: SFX cue file "${cue.file}" not resolved (not in catalog or library) — dropping`);
      continue;
    }
    sfx.push({
      file: cue.file,
      t: Number((cue.start_s + cue.t_local).toFixed(3)),
      duration,
      volume: cue.volume != null ? cue.volume : 0.35,
      scene_id: cue.sceneId,
      t_local: cue.t_local,
      note: cue.note || "",
    });
  }
  sfx.sort((a, b) => a.t - b.t);
  return sfx;
}
