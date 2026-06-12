#!/usr/bin/env node
// preview-beat.mjs — snapshot a SINGLE beat's window from an assembled w2h
// project. Use during beat iteration: you've built `compositions/beat-3-X.html`,
// you want to see what frames the renderer produces for THAT beat without
// browsing the whole video's contact sheet.
//
// Mechanism: walks compositions/ in the same sort order w2h-prep uses
// (readdirSync(...).sort()), sums each beat's data-duration to compute the
// target beat's cumulative start_s, then invokes `hyperframes snapshot . --at
// <t1>,<t2>,...,<tN>` with frames evenly spaced inside the beat's [start_s,
// start_s+duration_s) window. The contact sheet that snapshot writes contains
// only the beat-local frames.
//
// REQUIRES: project's index.html must exist (assembler has run at least once).
// snapshot snapshots whatever index.html points to — if a beat's data-duration
// has changed since the last assemble-index run, re-run that first.
//
// Usage:
//   node preview-beat.mjs --hyperframes <projectDir> --beat compositions/beat-3-X.html [--frames 5]
//
// Beat arg accepts: a path under compositions/, a bare filename, or the
// composition-id slug (matched case-insensitive against scanned files).

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve, basename, extname } from "node:path";
import { spawnSync } from "node:child_process";

function parseArgs(argv) {
  const args = { hyperframes: ".", beat: "", frames: 5 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--hyperframes") args.hyperframes = argv[++i];
    else if (a === "--beat") args.beat = argv[++i];
    else if (a === "--frames") args.frames = Number(argv[++i]);
    else if (a === "--help" || a === "-h") args.help = true;
  }
  return args;
}

function die(msg) {
  console.error(`✗ preview-beat: ${msg}`);
  process.exit(1);
}

const args = parseArgs(process.argv);
if (args.help || !args.beat) {
  console.log(
    "Usage: node preview-beat.mjs --hyperframes <dir> --beat <comp-file> [--frames 5]\n" +
      "Snapshots only the frames inside ONE beat's timeline window.",
  );
  process.exit(args.help ? 0 : 1);
}

const projectDir = resolve(args.hyperframes);
const compDir = join(projectDir, "compositions");
if (!existsSync(compDir) || !statSync(compDir).isDirectory()) {
  die(`no compositions/ directory at ${compDir}`);
}
if (!existsSync(join(projectDir, "index.html"))) {
  die("project has no index.html — run scripts/assemble-index.mjs first");
}

// Mirror w2h-prep's scanCompositionsDir ordering: readdirSync().sort(), HTML
// only, exclude captions.html (caption track isn't a beat).
const files = readdirSync(compDir)
  .filter((f) => extname(f) === ".html" && f !== "captions.html")
  .sort();

const DUR_RE = /data-duration\s*=\s*["']?([0-9]+(?:\.[0-9]+)?)/i;
const ID_RE = /data-composition-id\s*=\s*["']([^"']+)["']/i;

let cumStart = 0;
let target = null;
for (const f of files) {
  const html = readFileSync(join(compDir, f), "utf-8");
  const dm = html.match(DUR_RE);
  const im = html.match(ID_RE);
  const dur = dm ? Number(dm[1]) : null;
  const id = im ? im[1] : null;
  if (dur == null || !isFinite(dur) || dur <= 0) continue;
  const isTarget =
    f === basename(args.beat) ||
    `compositions/${f}` === args.beat ||
    (id && id.toLowerCase() === args.beat.toLowerCase());
  if (isTarget) {
    target = { file: f, id, start: cumStart, duration: dur };
    break;
  }
  cumStart += dur;
}

if (!target) die(`beat "${args.beat}" not found in compositions/ (scanned ${files.length} files)`);

const N = Math.max(1, Math.floor(args.frames));
const stamps = [];
for (let i = 0; i < N; i++) {
  const t = target.start + (target.duration * (i + 0.5)) / N;
  stamps.push(Number(t.toFixed(3)));
}

const cliPath = resolve(projectDir, "packages/cli/src/cli.ts");
const cliArgv = existsSync(cliPath)
  ? ["tsx", cliPath, "snapshot", projectDir, "--at", stamps.join(",")]
  : ["hyperframes", "snapshot", projectDir, "--at", stamps.join(",")];

console.log(
  `▸ beat ${target.id || target.file} window [${target.start}s, ${(target.start + target.duration).toFixed(3)}s); snapshotting at ${stamps.join(", ")}s`,
);
const r = spawnSync("npx", cliArgv, { stdio: "inherit" });
process.exit(r.status ?? 1);
