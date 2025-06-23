export interface TouchScrollState {
  isMobile: boolean;
  manualCamX: number;
  touchStartX: number;
  touchStartCamX: number;
  isDragging: boolean;
  hasManualPosition: boolean;
  touchActive: boolean;
}

export interface TouchScrollCallbacks {
  getCurrentCamX: () => number;
  onCameraUpdate?: (camX: number) => void;
}

export function createTouchScrollState(): TouchScrollState {
  return {
    isMobile: "ontouchstart" in window,
    manualCamX: 0,
    touchStartX: 0,
    touchStartCamX: 0,
    isDragging: false,
    hasManualPosition: false,
    touchActive: false,
  };
}

export function setupTouchScroll(
  canvas: HTMLCanvasElement,
  state: TouchScrollState,
  callbacks: TouchScrollCallbacks,
) {
  if (!state.isMobile) return;

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      state.touchStartX = e.touches[0].clientX;
      // Use the current displayed camera position (manual if exists, otherwise current)
      state.touchStartCamX = state.hasManualPosition
        ? state.manualCamX
        : callbacks.getCurrentCamX();
      state.touchActive = true;
      state.isDragging = false; // Don't start dragging until we detect movement
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (state.touchActive && e.touches.length === 1) {
      e.preventDefault();
      const touchX = e.touches[0].clientX;
      const deltaX = touchX - state.touchStartX;

      // Only start dragging if there's significant movement (prevents accidental scrolling)
      if (!state.isDragging && Math.abs(deltaX) > 5) {
        state.isDragging = true;
      }

      if (state.isDragging) {
        // Invert delta for natural scrolling (drag right = scroll left)
        state.manualCamX = state.touchStartCamX - deltaX;

        if (callbacks.onCameraUpdate) {
          callbacks.onCameraUpdate(state.manualCamX);
        }
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (e.touches.length === 0) {
      e.preventDefault();
      state.touchActive = false;
      if (state.isDragging) {
        state.isDragging = false;
        state.hasManualPosition = true; // Maintain the position after drag ends
      }
    }
  };

  canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
  canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
  canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

  // Return cleanup function
  return () => {
    canvas.removeEventListener("touchstart", handleTouchStart);
    canvas.removeEventListener("touchmove", handleTouchMove);
    canvas.removeEventListener("touchend", handleTouchEnd);
  };
}

export function getCameraX(
  state: TouchScrollState,
  defaultCamX: number,
): number {
  return state.isDragging || state.hasManualPosition
    ? state.manualCamX
    : defaultCamX;
}

export function resetManualPosition(state: TouchScrollState) {
  state.hasManualPosition = false;
  state.manualCamX = 0;
}

export function getSimpleCameraX(
  touchScrollState: TouchScrollState,
  animating: boolean,
  fromIdx: number,
  toIdx: number,
  hopStart: number,
  hopDur: number,
  gap: number,
  canvasWidth: number,
  getCurrentTime: () => number,
): number {
  // If user has manually positioned camera, respect that
  if (touchScrollState.hasManualPosition) {
    return touchScrollState.manualCamX;
  }

  // Default behavior: follow the animated frog (centers on frog)
  const t = getCurrentTime();
  const alpha = animating
    ? Math.max(0, Math.min(1, (t - hopStart) / hopDur))
    : 1;
  const currentFrogIdx = fromIdx + (toIdx - fromIdx) * alpha; // Manual lerp to avoid p5 dependency
  return currentFrogIdx * gap - canvasWidth / 2;
}
