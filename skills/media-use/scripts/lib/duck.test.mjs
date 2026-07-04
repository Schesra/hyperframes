import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { duckKeyframes, speechSpans } from "./duck.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, "..", "audio-duck.mjs");

test("speechSpans bridges gaps smaller than mergeGap", () => {
  const meta = {
    words: [word("w0", "one", 0, 0.5), word("w1", "two", 0.8, 1), word("w2", "three", 2, 2.2)],
  };

  assert.deepEqual(speechSpans(meta, { mergeGap: 0.4 }), [
    { start: 0, end: 1 },
    { start: 2, end: 2.2 },
  ]);
});

test("speechSpans unions overlapping voice lines", () => {
  const meta = {
    voices: [
      { id: "a", words: [word("w0", "one", 0, 1), word("w1", "two", 2, 3)] },
      { id: "b", words: [word("w2", "overlap", 0.5, 1.5)] },
    ],
  };

  assert.deepEqual(speechSpans(meta, { mergeGap: 0.2 }), [
    { start: 0, end: 1.5 },
    { start: 2, end: 3 },
  ]);
});

test("speechSpans returns empty spans for empty input", () => {
  assert.deepEqual(speechSpans({ voices: [] }, { mergeGap: 0.6 }), []);
});

test("duckKeyframes shapes attack and release from base volume", () => {
  assert.deepEqual(
    duckKeyframes([{ start: 3, end: 5 }], {
      duck: 0.25,
      attack: 0.15,
      release: 0.4,
      baseVolume: 0.6,
    }),
    [
      { time: 3, volume: 0.15, duration: 0.15 },
      { time: 5, volume: 0.6, duration: 0.4 },
    ],
  );
});

test("--json spans match --merge-gap semantics exactly", () => {
  const dir = mkdtempSync(join(tmpdir(), "media-use-duck-"));
  try {
    const metaPath = join(dir, "audio_meta.json");
    writeFileSync(
      metaPath,
      JSON.stringify({
        voices: [
          {
            id: "narration",
            words: [
              word("w0", "one", 0, 0.4),
              word("w1", "two", 0.9, 1.2),
              word("w2", "three", 1.8, 2.1),
            ],
          },
        ],
      }),
    );

    const out = execFileSync(
      process.execPath,
      [SCRIPT, "--meta", metaPath, "--target", "#bgm", "--merge-gap", "0.6", "--json"],
      { encoding: "utf8" },
    );

    const parsed = JSON.parse(out);
    assert.deepEqual(parsed.spans, [
      { start: 0, end: 1.2 },
      { start: 1.8, end: 2.1 },
    ]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

function word(id, text, start, end) {
  return { id, text, start, end };
}
