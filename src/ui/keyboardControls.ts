export interface KeyboardControlCallbacks {
  onLeftHop?: () => void;
  onRightHop?: () => void;
  onCustomKey?: (key: string, event: KeyboardEvent) => void;
}

export interface KeyboardControlState {
  readyCheck: () => boolean;
  animationCheck?: () => boolean; // Returns true if animation is in progress
}

/**
 * Sets up keyboard controls for game modes with automatic cleanup.
 * Returns a cleanup function that can be called manually if needed.
 */
export function setupKeyboardControls(
  rootElement: HTMLElement,
  componentElement: HTMLElement,
  callbacks: KeyboardControlCallbacks,
  state: KeyboardControlState,
): () => void {
  let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  function enableKeyboardControls() {
    keydownHandler = (e: KeyboardEvent) => {
      // Check if component is ready
      if (!state.readyCheck()) return;

      // Check if animation is in progress (blocks input)
      if (state.animationCheck && state.animationCheck()) return;

      // Handle left hop (arrow left or 'a')
      if ((e.key === "ArrowLeft" || e.key === "a") && callbacks.onLeftHop) {
        e.preventDefault();
        callbacks.onLeftHop();
        return;
      }

      // Handle right hop (arrow right or 'd')
      if ((e.key === "ArrowRight" || e.key === "d") && callbacks.onRightHop) {
        e.preventDefault();
        callbacks.onRightHop();
        return;
      }

      // Handle custom keys
      if (callbacks.onCustomKey) {
        callbacks.onCustomKey(e.key, e);
      }
    };

    window.addEventListener("keydown", keydownHandler, true);
  }

  // Cleanup function
  const cleanup = () => {
    if (keydownHandler) {
      window.removeEventListener("keydown", keydownHandler, true);
      keydownHandler = null;
    }
  };

  // Enable keyboard controls immediately
  enableKeyboardControls();

  // Set up automatic cleanup when component is unmounted
  const observer = new MutationObserver(() => {
    if (!rootElement.contains(componentElement)) {
      cleanup();
      observer.disconnect();
    }
  });
  observer.observe(rootElement, { childList: true });

  // Return cleanup function for manual cleanup if needed
  return cleanup;
}
