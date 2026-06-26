import { strict as assert } from "node:assert";
import { test } from "node:test";
import { isDirectMediaUrl } from "./freeze.mjs";

test("accepts direct public media URLs", () => {
  assert.equal(isDirectMediaUrl("https://cdn.example.com/clip.mp4"), true);
  assert.equal(isDirectMediaUrl("https://example.com/a/b/track.mp3"), true);
  assert.equal(isDirectMediaUrl("http://example.com/logo.svg"), true);
});

test("rejects platform pages (no yt-dlp)", () => {
  assert.equal(isDirectMediaUrl("https://www.youtube.com/watch?v=abc"), false);
  assert.equal(isDirectMediaUrl("https://youtu.be/abc"), false);
  assert.equal(isDirectMediaUrl("https://vimeo.com/12345"), false);
  assert.equal(isDirectMediaUrl("https://x.com/u/status/1"), false);
});

test("rejects non-direct / non-media URLs", () => {
  assert.equal(isDirectMediaUrl("https://example.com/page"), false, "no media extension");
  assert.equal(isDirectMediaUrl("ftp://example.com/a.mp4"), false, "non-http(s)");
  assert.equal(isDirectMediaUrl("not a url"), false);
});
