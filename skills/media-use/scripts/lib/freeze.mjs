import { writeFileSync, copyFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

// ponytail: bound the download so a hostile/runaway URL can't fill the disk.
// 256MB covers any real media asset; raise if 4K video sources ever exceed it.
const MAX_FREEZE_BYTES = 256 * 1024 * 1024;

export async function freezeUrl(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`freeze failed: HTTP ${res.status} for ${String(url).slice(0, 80)}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.length === 0)
    throw new Error(`freeze failed: empty response for ${String(url).slice(0, 80)}`);
  if (bytes.length > MAX_FREEZE_BYTES)
    throw new Error(
      `freeze failed: ${bytes.length} bytes exceeds ${MAX_FREEZE_BYTES} cap for ${String(url).slice(0, 80)}`,
    );
  mkdirSync(dirname(destPath), { recursive: true });
  writeFileSync(destPath, bytes);
  return bytes.length;
}

export function freezeLocalFile(srcPath, destPath) {
  mkdirSync(dirname(destPath), { recursive: true });
  copyFileSync(srcPath, destPath);
}

// Ingest accepts a DIRECT public media URL only — not a platform page. yt-dlp is
// deliberately out (cloud IPs get blocked, and it's brittle); the supported case
// is "user points at their own file or a direct asset link". A direct URL is a
// non-platform host whose path ends in a known media extension.
const PLATFORM_HOSTS =
  /(^|\.)(youtube\.com|youtu\.be|vimeo\.com|tiktok\.com|instagram\.com|twitter\.com|x\.com|facebook\.com|dailymotion\.com)$/i;
const MEDIA_EXT = /\.(mp3|wav|m4a|aac|ogg|flac|mp4|mov|webm|mkv|png|jpe?g|webp|gif|svg|avif)$/i;

export function isDirectMediaUrl(u) {
  let url;
  try {
    url = new URL(u);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  if (PLATFORM_HOSTS.test(url.hostname)) return false;
  return MEDIA_EXT.test(url.pathname);
}
