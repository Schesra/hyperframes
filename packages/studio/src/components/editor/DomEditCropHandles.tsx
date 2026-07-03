import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import type { DomEditSelection } from "./domEditing";
import type { OverlayRect } from "./domEditOverlayGeometry";
import { type CropEdge, resolveCropInsetFromEdgeDrag } from "./domEditOverlayCrop";
import {
  buildInsetClipPathSides,
  parseInsetClipPathSides,
  type ClipPathInsetSides,
} from "./clipPathHelpers";

interface CropGestureState {
  edge: CropEdge;
  selection: DomEditSelection;
  pointerId: number;
  startX: number;
  startY: number;
  startInsets: ClipPathInsetSides;
  radius: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  previousInlineClipPath: string;
  lastValue: string;
  didMove: boolean;
}

interface DomEditCropHandlesProps {
  selection: DomEditSelection;
  overlayRect: OverlayRect;
  onStyleCommit?: (property: string, value: string) => Promise<void> | void;
}

function readCurrentClipPath(selection: DomEditSelection): {
  currentClipPath: string;
  inlineClipPath: string;
} {
  const inlineValue = selection.element.style.getPropertyValue("clip-path").trim();
  if (inlineValue) return { currentClipPath: inlineValue, inlineClipPath: inlineValue };
  const win = selection.element.ownerDocument.defaultView;
  const computed = win?.getComputedStyle(selection.element).clipPath.trim();
  return {
    currentClipPath: computed && computed !== "none" ? computed : "none",
    inlineClipPath: "",
  };
}

function restoreInlineClipPath(gesture: CropGestureState): void {
  if (gesture.previousInlineClipPath) {
    gesture.selection.element.style.setProperty("clip-path", gesture.previousInlineClipPath);
  } else {
    gesture.selection.element.style.removeProperty("clip-path");
  }
}

function defaultInsets(): ClipPathInsetSides {
  return { top: 0, right: 0, bottom: 0, left: 0 };
}

function handleCenter(edge: CropEdge, rect: OverlayRect): { left: number; top: number } {
  if (edge === "top") return { left: rect.left + rect.width / 2, top: rect.top };
  if (edge === "right") return { left: rect.left + rect.width, top: rect.top + rect.height / 2 };
  if (edge === "bottom") return { left: rect.left + rect.width / 2, top: rect.top + rect.height };
  return { left: rect.left, top: rect.top + rect.height / 2 };
}

const EDGES: CropEdge[] = ["top", "right", "bottom", "left"];

export function DomEditCropHandles({
  selection,
  overlayRect,
  onStyleCommit,
}: DomEditCropHandlesProps) {
  const gestureRef = useRef<CropGestureState | null>(null);

  useEffect(
    () => () => {
      const gesture = gestureRef.current;
      if (!gesture) return;
      restoreInlineClipPath(gesture);
      gestureRef.current = null;
    },
    [],
  );

  const startCropGesture = (edge: CropEdge, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!onStyleCommit) return;
    const { currentClipPath, inlineClipPath } = readCurrentClipPath(selection);
    const parsed = parseInsetClipPathSides(currentClipPath);
    const startInsets = parsed
      ? { top: parsed.top, right: parsed.right, bottom: parsed.bottom, left: parsed.left }
      : defaultInsets();
    const scaleX = overlayRect.editScaleX > 0 ? overlayRect.editScaleX : 1;
    const scaleY = overlayRect.editScaleY > 0 ? overlayRect.editScaleY : 1;
    const width = overlayRect.width / scaleX;
    const height = overlayRect.height / scaleY;
    const lastValue = buildInsetClipPathSides(startInsets, parsed?.radius ?? 0);
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    gestureRef.current = {
      edge,
      selection,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startInsets,
      radius: parsed?.radius ?? 0,
      width,
      height,
      scaleX,
      scaleY,
      previousInlineClipPath: inlineClipPath,
      lastValue,
      didMove: false,
    };
  };

  const updateCropGesture = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    const nextInsets = resolveCropInsetFromEdgeDrag({
      edge: gesture.edge,
      startInsets: gesture.startInsets,
      deltaX: event.clientX - gesture.startX,
      deltaY: event.clientY - gesture.startY,
      scaleX: gesture.scaleX,
      scaleY: gesture.scaleY,
      width: gesture.width,
      height: gesture.height,
    });
    const nextValue = buildInsetClipPathSides(nextInsets, gesture.radius);
    gesture.selection.element.style.setProperty("clip-path", nextValue);
    gesture.lastValue = nextValue;
    gesture.didMove = true;
  };

  const finishCropGesture = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    gestureRef.current = null;
    if (gesture.didMove) void onStyleCommit?.("clip-path", gesture.lastValue);
  };

  const cancelCropGesture = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    restoreInlineClipPath(gesture);
    gestureRef.current = null;
  };

  return (
    <>
      {EDGES.map((edge) => {
        const center = handleCenter(edge, overlayRect);
        const vertical = edge === "left" || edge === "right";
        return (
          <button
            key={edge}
            type="button"
            aria-label={`Crop ${edge}`}
            data-dom-edit-crop-handle="true"
            className="pointer-events-auto absolute rounded-sm border border-studio-accent bg-studio-accent shadow-[0_0_0_2px_rgba(60,230,172,0.18)]"
            style={{
              left: center.left,
              top: center.top,
              width: vertical ? 10 : 28,
              height: vertical ? 28 : 10,
              transform: "translate(-50%, -50%)",
              cursor: vertical ? "ew-resize" : "ns-resize",
              touchAction: "none",
            }}
            onPointerDown={(event) => startCropGesture(edge, event)}
            onPointerMove={updateCropGesture}
            onPointerUp={finishCropGesture}
            onPointerCancel={cancelCropGesture}
          />
        );
      })}
    </>
  );
}
