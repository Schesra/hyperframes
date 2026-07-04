import { wordListsFromMediaMeta } from "./words.mjs";

export function speechSpans(meta, { mergeGap = 0.6 } = {}) {
  const gap = Number(mergeGap);
  const intervals = [];
  for (const words of wordListsFromMediaMeta(meta)) {
    for (const word of words) {
      if (word.end > word.start) intervals.push({ start: word.start, end: word.end });
    }
  }
  return mergeIntervals(intervals, Number.isFinite(gap) && gap >= 0 ? gap : 0.6);
}

export function duckKeyframes(
  spans,
  { duck = 0.25, attack = 0.15, release = 0.4, baseVolume = 1 } = {},
) {
  const base = finiteOr(baseVolume, 1);
  const ducked = round3(base * finiteOr(duck, 0.25));
  const keyframes = [];
  for (const span of spans) {
    keyframes.push({
      time: round3(Math.max(0, finiteOr(span.start, 0))),
      volume: ducked,
      duration: round3(finiteOr(attack, 0.15)),
    });
    keyframes.push({
      time: round3(Math.max(0, finiteOr(span.end, 0))),
      volume: round3(base),
      duration: round3(finiteOr(release, 0.4)),
    });
  }
  return keyframes.sort((a, b) => a.time - b.time);
}

function mergeIntervals(intervals, mergeGap) {
  const sorted = intervals
    .map((range) => ({ start: round3(range.start), end: round3(range.end) }))
    .sort((a, b) => a.start - b.start || a.end - b.end);
  const merged = [];
  for (const range of sorted) {
    const prev = merged.at(-1);
    if (prev && (range.start <= prev.end || range.start - prev.end < mergeGap)) {
      prev.end = Math.max(prev.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}

function finiteOr(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function round3(n) {
  return Math.round(Number(n) * 1000) / 1000;
}
