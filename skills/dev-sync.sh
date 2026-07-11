#!/usr/bin/env bash
# dev-sync.sh — sync repo skill sources to the installed harness copies.
#
# The Skill tool reads ~/.claude/skills/<name>, NOT this repo. After editing a
# skill here, run this or the installed copy stays stale (it bit us: the
# installed bitsness-video lagged several revisions behind the repo).
#
#   bash skills/dev-sync.sh          # from the repo root
set -euo pipefail
cd "$(dirname "$0")/.."
DEST="${HOME}/.claude/skills"

# skills we develop in this repo AND keep installed
for s in bitsness-video; do
  rm -rf "${DEST}/${s}"
  cp -r "skills/${s}" "${DEST}/${s}"
  echo "synced skill: ${s}"
done

# media-use SFX library: mirror the curated set (add new, drop removed)
SRC_SFX="skills/media-use/audio/assets/sfx"
DST_SFX="${DEST}/media-use/audio/assets/sfx"
if [ -d "${SRC_SFX}" ] && [ -d "${DST_SFX}" ]; then
  cp "${SRC_SFX}"/* "${DST_SFX}/" 2>/dev/null || true
  for f in "${DST_SFX}"/*.mp3; do
    b="$(basename "$f")"
    [ -f "${SRC_SFX}/${b}" ] || { echo "removed stale sfx: ${b}"; rm "$f"; }
  done
  echo "synced media-use sfx ($(ls "${DST_SFX}"/*.mp3 | wc -l) files)"
fi
echo "done."
