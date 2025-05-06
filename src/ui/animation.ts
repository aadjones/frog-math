import p5 from 'p5';
import { canvas, worldX, gap } from './shared';
import { frogYArc } from '../frogPhysics';

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
  showAvailable: boolean;
  isReachable: (idx: number) => boolean;
  showTarget?: (idx: number, screenX: number) => void;
  showBadge?: (frogXw: number, frogY: number, camX: number) => void;
  debugMode: boolean;
  onWin?: (frogXw: number, camX: number) => void;
}

export function drawAnimationFrame({
  p,
  state,
  showAvailable,
  isReachable,
  showTarget,
  showBadge,
  debugMode,
  onWin
}: DrawOptions) {
  const { frogIdx, fromIdx, toIdx, hopStart, hopDur, animating, setAnimating } = state;
  const t = p.millis();

  // Calculate animation progress
  // If animating is undefined, we're in continuous mode (single player)
  // If animating is defined, we're in state-based mode (multi player)
  const alpha = animating === undefined
    ? p.constrain((t - hopStart) / hopDur, 0, 1)
    : (animating ? p.constrain((t - hopStart) / hopDur, 0, 1) : 1);
  
  // Handle animation completion only in state-based mode
  if (animating && alpha === 1 && setAnimating) {
    setAnimating(false);
  }

  // Calculate positions
  const frogXw = p.lerp(fromIdx, toIdx, alpha) * gap;
  const frogY = frogYArc(alpha, canvas.h / 2, 20);
  const camX = frogXw - canvas.w / 2;

  // Clear background
  p.background(255);

  // Draw lily pads
  const start = Math.min(-10, frogIdx - 10);
  const end = frogIdx + 10;
  for (let i = start; i <= end; i++) {
    const screenX = worldX(i) - camX;
    
    // Skip current pad - we'll draw it last
    if (i === frogIdx) continue;

    // Draw pad
    const reachable = isReachable(i);
    p.fill(showAvailable && reachable ? '#8f8' : '#ddd');
    p.circle(screenX, canvas.h / 2, 24);

    // Draw target if provided
    if (showTarget) {
      showTarget(i, screenX);
    }

    // Draw debug labels if enabled
    if (debugMode) {
      p.fill(0);
      p.textSize(12);
      p.textAlign(p.CENTER, p.TOP);
      p.text(i.toString(), screenX, canvas.h / 2 + 30);
      p.textSize(24); // Reset text size
    }
  }

  // Draw current pad last with darker green
  const currentPadX = worldX(frogIdx) - camX;
  p.fill('#4a4');
  p.circle(currentPadX, canvas.h / 2, 24);

  // Draw debug label for current pad if enabled
  if (debugMode) {
    p.fill(0);
    p.textSize(12);
    p.textAlign(p.CENTER, p.TOP);
    p.text(frogIdx.toString(), currentPadX, canvas.h / 2 + 30);
    p.textSize(24); // Reset text size
  }

  // Draw frog
  p.textSize(32);
  p.textAlign(p.CENTER, p.CENTER);
  p.text('🐸', frogXw - camX, frogY - 12);

  // Draw badge if provided
  if (showBadge) {
    showBadge(frogXw, frogY, camX);
  }

  // Handle win condition if provided
  if (onWin) {
    onWin(frogXw, camX);
  }
} 