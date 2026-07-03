import { describe, expect, it } from "vitest";
import { resolveCropInsetFromEdgeDrag } from "./domEditOverlayCrop";

describe("resolveCropInsetFromEdgeDrag", () => {
  const startInsets = { top: 10, right: 20, bottom: 30, left: 40 };

  it("converts overlay-space edge movement into element-space inset changes", () => {
    expect(
      resolveCropInsetFromEdgeDrag({
        edge: "left",
        startInsets,
        deltaX: 20,
        deltaY: 0,
        scaleX: 2,
        scaleY: 1,
        width: 200,
        height: 120,
      }),
    ).toEqual({ top: 10, right: 20, bottom: 30, left: 50 });

    expect(
      resolveCropInsetFromEdgeDrag({
        edge: "right",
        startInsets,
        deltaX: 20,
        deltaY: 0,
        scaleX: 2,
        scaleY: 1,
        width: 200,
        height: 120,
      }),
    ).toEqual({ top: 10, right: 10, bottom: 30, left: 40 });
  });

  it("clamps edited insets so opposing sides never overlap", () => {
    expect(
      resolveCropInsetFromEdgeDrag({
        edge: "left",
        startInsets,
        deltaX: 400,
        deltaY: 0,
        scaleX: 1,
        scaleY: 1,
        width: 100,
        height: 120,
      }),
    ).toEqual({ top: 10, right: 20, bottom: 30, left: 80 });

    expect(
      resolveCropInsetFromEdgeDrag({
        edge: "top",
        startInsets,
        deltaX: 0,
        deltaY: -40,
        scaleX: 1,
        scaleY: 2,
        width: 200,
        height: 120,
      }),
    ).toEqual({ top: 0, right: 20, bottom: 30, left: 40 });
  });
});
