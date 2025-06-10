import p5 from "p5";
import { canvas, worldX, gap } from "./shared";
import { frogYArc } from "../frogPhysics";
import { drawFrog } from "./imageLoader";

export interface AnimationState {
  frogIdx: number;
  fromIdx: number;
  toIdx: number;
  hopStart: number;
  hopDur: number;
  animating?: boolean;
  setAnimating?: (b: boolean) => void;
}

export interface DrawOptions {
  p: p5;
  state: AnimationState;
  isReachable: (idx: number) => boolean;
  showTarget?: (idx: number, screenX: number) => void;
  showBadge?: (frogXw: number, frogY: number, camX: number) => void;
  debugMode: boolean;
  onWin?: (frogXw: number, camX: number) => void;
  frogImage?: p5.Image | null;
}

export function drawAnimationFrame({
  p,
  state,
  isReachable,
  showTarget,
  showBadge,
  debugMode,
  onWin,
  frogImage,
}: DrawOptions) {
  const { frogIdx, fromIdx, toIdx, hopStart, hopDur, animating, setAnimating } =
    state;
  const t = p.millis();

  // Calculate animation progress
  // If animating is undefined, we're in continuous mode (single player)
  // If animating is defined, we're in state-based mode (multi player)
  const alpha =
    animating === undefined
      ? p.constrain((t - hopStart) / hopDur, 0, 1)
      : animating
        ? p.constrain((t - hopStart) / hopDur, 0, 1)
        : 1;

  // Handle animation completion only in state-based mode
  if (animating && alpha === 1 && setAnimating) {
    setAnimating(false);
  }

  // Calculate positions
  const frogXw = p.lerp(fromIdx, toIdx, alpha) * gap;
  const frogY = frogYArc(alpha, canvas.h / 2, 20);
  const camX = frogXw - canvas.w / 2;

  // Determine frog direction based on movement
  const facingRight = toIdx >= fromIdx; // Face right by default, only face left when moving left

  // Clear background
  p.background(255);

  // Draw lily pads
  const padSize = 32;
  const frogSize = 40;
  const start = Math.min(-10, frogIdx - 10);
  const end = frogIdx + 10;
  for (let i = start; i <= end; i++) {
    const screenX = worldX(i) - camX;
    // Skip current pad - we'll draw it last
    if (i === frogIdx) continue;
    // Draw pad
    const reachable = isReachable(i);
    drawLilyPad(
      p,
      screenX,
      canvas.h / 2,
      padSize,
      reachable ? "#4a4" : "#8f8",
      { notchAngle: -p.QUARTER_PI, squish: 0.9 },
    );
    // Draw target if provided
    if (showTarget) {
      showTarget(i, screenX);
    }
    // Draw debug labels if enabled
    if (debugMode) {
      p.fill(0);
      p.textSize(12);
      p.textAlign(p.CENTER, p.TOP);
      p.text(i.toString(), screenX, canvas.h / 2 + padSize / 2 + 6);
      p.textSize(24); // Reset text size
    }
  }
  // Draw current pad last with light green
  const currentPadX = worldX(frogIdx) - camX;
  drawLilyPad(p, currentPadX, canvas.h / 2, padSize, "#8f8", {
    notchAngle: -p.QUARTER_PI,
    squish: 0.9,
  });
  // Draw frog using the new image-aware function at correct arc position
  const OFFSET = 10;
  drawFrog(p, frogXw - camX, frogY - OFFSET, frogImage, frogSize, facingRight);
  // Draw debug label for current pad if enabled
  if (debugMode) {
    p.fill(0);
    p.textSize(12);
    p.textAlign(p.CENTER, p.TOP);
    p.text(frogIdx.toString(), currentPadX, canvas.h / 2 + padSize / 2 + 6);
    p.textSize(24); // Reset text size
  }

  // Draw badge if provided
  if (showBadge) {
    showBadge(frogXw, frogY, camX);
  }

  // Handle win condition if provided
  if (onWin) {
    onWin(frogXw, camX);
  }
}

// Draw a cartoon lily pad as a section of an ellipse with a notch and outline only
export function drawLilyPad(
  p: p5,
  x: number,
  y: number,
  size: number,
  color: string,
  options: {
    notchAngle?: number;
    notchSize?: number;
    squish?: number | false;
  } = {},
) {
  const notchAngle = options.notchAngle ?? 0;
  const notchSize = options.notchSize ?? 1;
  const notchSpan = p.QUARTER_PI * notchSize; // how wide the notch is
  const halfSpan = notchSpan / 2;
  const w = size,
    h = size;

  p.push();
  // move to pad center
  p.translate(x, y);

  // rotate so that 0 rad in local coords is your notch direction
  p.rotate(notchAngle);

  // squash into an ellipse unless squish is false
  if (options.squish === false) {
    // no squish
  } else if (typeof options.squish === "number") {
    p.scale(1, options.squish);
  } else {
    p.scale(1, 0.8);
  }

  // draw the ellipse-minus-wedge via an ARC
  p.stroke(40, 80, 30);
  p.strokeWeight(4);
  p.fill(color);

  // draw the sector from halfSpan to TWO_PI-halfSpan, leaving a notch at 0 rad
  p.arc(0, 0, w, h, halfSpan, p.TWO_PI - halfSpan, p.PIE);
  p.pop();
}
