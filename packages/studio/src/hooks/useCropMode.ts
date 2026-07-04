import { useEffect, useMemo, useReducer } from "react";
import { usePlayerStore } from "../player";

export interface CropModeProps {
  cropMode: boolean;
  onCropModeChange: (active: boolean) => void;
}

/** Crop mode lives in the player store so the canvas toolbar, the Clip panel,
 *  and the overlay all share one switch without prop threading. */
export function useCropModeProps(): CropModeProps {
  const cropMode = usePlayerStore((s) => s.cropMode);
  const setCropMode = usePlayerStore((s) => s.setCropMode);
  return useMemo(
    () => ({
      cropMode,
      onCropModeChange: setCropMode,
    }),
    [cropMode, setCropMode],
  );
}

import type { OverlayRect } from "../components/editor/domEditOverlayGeometry";
import type { DomEditSelection } from "../components/editor/domEditing";
import { cropRectFromInsets, readElementCropInsets } from "../components/editor/domEditOverlayCrop";

/** Overlay-side crop state: Escape-to-exit, toolbar availability publishing,
 *  and the "hug the cropped region" rect for the selection box. */
export function useCropOverlay(params: {
  selection: DomEditSelection | null;
  groupCount: number;
  cropMode: boolean;
  onCropModeChange?: (active: boolean) => void;
  overlayRect: OverlayRect | null;
}) {
  const { selection, groupCount, cropMode, onCropModeChange, overlayRect } = params;

  useEffect(() => {
    if (!cropMode || !onCropModeChange) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCropModeChange(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cropMode, onCropModeChange]);

  // Publish availability so the canvas toolbar shows the Crop button only
  // when the selection can take a clip-path crop.
  const setCropAvailable = usePlayerStore((s) => s.setCropAvailable);
  const cropAvailable = Boolean(
    selection && groupCount <= 1 && selection.capabilities.canEditStyles,
  );
  useEffect(() => {
    setCropAvailable(cropAvailable);
    return () => setCropAvailable(false);
  }, [cropAvailable, setCropAvailable]);

  // Crop-mode exit restores the element's clip in an effect cleanup — after
  // this hook already read it. One forced re-render picks up the fresh insets
  // so the selection box hugs the crop immediately.
  const [, bumpAfterExit] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    if (!cropMode) bumpAfterExit();
  }, [cropMode]);

  const cropInsets = selection ? readElementCropInsets(selection.element) : null;
  const hasCropInsets = Boolean(
    cropInsets &&
    (cropInsets.top > 0 || cropInsets.right > 0 || cropInsets.bottom > 0 || cropInsets.left > 0),
  );
  // Outside crop mode the selection box hugs the visible (cropped) region so
  // the overlay matches what's actually on screen; crop mode shows the full
  // element bounds (the crop frame is drawn by DomEditCropHandles).
  const visualRect =
    overlayRect && cropInsets && hasCropInsets && !cropMode
      ? cropRectFromInsets(overlayRect, cropInsets, overlayRect.editScaleX, overlayRect.editScaleY)
      : overlayRect;

  return { hasCropInsets, visualRect };
}
