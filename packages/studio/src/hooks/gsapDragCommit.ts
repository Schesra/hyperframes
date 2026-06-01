/**
 * Pure helpers for GSAP-aware drag persistence. When an element has a GSAP
 * tween controlling x/y, these functions compute the new GSAP position from
 * the studio offset delta and dispatch the correct GSAP script mutation.
 */
import type { GsapAnimation } from "@hyperframes/core/gsap-parser";
import type { DomEditSelection } from "../components/editor/domEditingTypes";
import { clearStudioPathOffset } from "../components/editor/manualEdits";

/** Callbacks for writing GSAP position changes via the script mutation API. */
export interface GsapPositionCommitCallbacks {
  /** Commit a GSAP mutation through the script mutation pipeline. */
  commitMutation: (
    selection: DomEditSelection,
    mutation: Record<string, unknown>,
    options: { label: string; coalesceKey?: string; softReload?: boolean },
  ) => Promise<void>;
}

/**
 * Find the GSAP animation that controls position (x/y) for an element.
 * Returns null when the element has no GSAP position tween.
 */
// fallow-ignore-next-line complexity
export function findGsapPositionAnimation(animations: GsapAnimation[]): GsapAnimation | null {
  if (animations.length === 0) return null;
  for (const anim of animations) {
    // Skip from() tweens — their properties are the FROM state, not the target
    // position. The standard CSS offset path handles from() correctly since the
    // CSS position IS the to-state that GSAP animates toward.
    if (anim.method === "from") continue;
    if ("x" in anim.properties || "y" in anim.properties) return anim;
    if (anim.keyframes) {
      const hasPosition = anim.keyframes.keyframes.some(
        (kf) => "x" in kf.properties || "y" in kf.properties,
      );
      if (hasPosition) return anim;
    }
  }
  return null;
}

/**
 * Read the current GSAP x/y values for an animation at a given playhead
 * percentage. For flat tweens, reads from properties. For keyframe tweens,
 * finds the nearest keyframe values at or before the percentage.
 */
// fallow-ignore-next-line complexity
function readGsapPositionAtPercentage(
  anim: GsapAnimation,
  percentage: number,
): { x: number; y: number } {
  if (anim.keyframes) {
    let x = 0;
    let y = 0;
    for (const kf of anim.keyframes.keyframes) {
      if (kf.percentage <= percentage) {
        if ("x" in kf.properties) x = Number(kf.properties.x) || 0;
        if ("y" in kf.properties) y = Number(kf.properties.y) || 0;
      }
    }
    return { x, y };
  }
  return {
    x: Number(anim.properties.x) || 0,
    y: Number(anim.properties.y) || 0,
  };
}

/**
 * Compute the playhead percentage within an element's local timeline.
 * Returns a value clamped to [0, 100].
 */
// fallow-ignore-next-line complexity
function computeElementPercentage(
  currentTime: number,
  dataAttributes: Record<string, string> | undefined,
): number {
  const elStart = Number.parseFloat(dataAttributes?.start ?? "0");
  const elDuration = Number.parseFloat(dataAttributes?.duration ?? "1");
  if (elDuration <= 0) return 0;
  const raw = ((currentTime - elStart) / elDuration) * 100;
  return Math.max(0, Math.min(100, raw));
}

/**
 * Commit a position drag to GSAP script instead of CSS. The `studioOffset`
 * is the delta from the element's GSAP-positioned location — added to the
 * current GSAP x/y values to produce the new GSAP position.
 */
// fallow-ignore-next-line complexity
export function commitGsapPositionDrag(
  selection: DomEditSelection,
  anim: GsapAnimation,
  studioOffset: { x: number; y: number },
  currentTime: number,
  callbacks: GsapPositionCommitCallbacks,
): void {
  const pct = computeElementPercentage(currentTime, selection.dataAttributes);
  const currentPos = readGsapPositionAtPercentage(anim, pct);
  const newX = Math.round(currentPos.x + studioOffset.x);
  const newY = Math.round(currentPos.y + studioOffset.y);

  if (anim.keyframes) {
    const clampedPct = Math.max(0, Math.min(100, Math.round(pct)));
    const props: Record<string, number | string> = { x: newX, y: newY };
    void callbacks.commitMutation(
      selection,
      { type: "add-keyframe", animationId: anim.id, percentage: clampedPct, properties: props },
      {
        label: `Move layer (keyframe ${clampedPct}%)`,
        coalesceKey: `gsap-drag:${anim.id}:kf:${clampedPct}`,
        softReload: true,
      },
    );
  } else {
    void callbacks.commitMutation(
      selection,
      { type: "update-property", animationId: anim.id, property: "x", value: newX },
      {
        label: "Move layer (GSAP x)",
        coalesceKey: `gsap-drag:${anim.id}:x`,
        softReload: true,
      },
    );
    void callbacks.commitMutation(
      selection,
      { type: "update-property", animationId: anim.id, property: "y", value: newY },
      {
        label: "Move layer (GSAP y)",
        coalesceKey: `gsap-drag:${anim.id}:y`,
        softReload: true,
      },
    );
  }

  // Clear the studio offset — GSAP will handle position after the soft-reload
  clearStudioPathOffset(selection.element);
}
