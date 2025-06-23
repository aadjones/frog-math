import { MS_PER_PAD, playbackRate } from "../frogPhysics";

/* shared constants & helpers for all frog modes */
export const gap = 60;

// Get responsive canvas width based on screen size
function getResponsiveCanvasWidth() {
  return Math.min(600, window.innerWidth - 40); // 40px for padding
}

export const canvas = {
  get w() {
    return getResponsiveCanvasWidth();
  },
  h: 160,
};

/* World helpers */
export const worldX = (idx: number) => idx * gap;

/* Debug state (shared) */
export let debugMode = true; // Show numbers by default
export function toggleDebug() {
  debugMode = !debugMode;
}

/* Feature flags */
export interface FeatureFlags {
  showToggleLabelsButton: boolean;
  // Add more feature flags here as needed
}

const DEFAULT_FEATURES: FeatureFlags = {
  showToggleLabelsButton: false,
};

export const FEATURES: FeatureFlags = { ...DEFAULT_FEATURES };

export function setFeatureFlag<K extends keyof FeatureFlags>(
  flag: K,
  value: FeatureFlags[K],
): void {
  FEATURES[flag] = value;
}

export function getFeatureFlag<K extends keyof FeatureFlags>(
  flag: K,
): FeatureFlags[K] {
  return FEATURES[flag];
}

/* Frog reset helper (unified) */
export function resetFrog(
  gameState: GameState,
  sketchMillis?: () => number,
) {
  const currentFrogIdx = gameState.frogIdx;
  gameState.setFromIdx(currentFrogIdx);
  gameState.setToIdx(0);
  gameState.setFrogIdx(0);

  // Handle animation if sketch timing is provided
  if (sketchMillis) {
    gameState.setHopDur(MS_PER_PAD * Math.max(1, Math.abs(currentFrogIdx)));
    gameState.setHopStart(sketchMillis());
    gameState.setAnimating(true);
  } else {
    // Instant reset
    gameState.setHopStart(performance.now());
  }
}



/* Frog intro animation (no sound) */
export function animateFrogIntro(
  gameState: GameState,
  fromIdx: number,
  toIdx: number,
  sketchMillis: () => number,
) {
  gameState.setFromIdx(fromIdx);
  gameState.setToIdx(toIdx);
  gameState.setHopDur(MS_PER_PAD * Math.max(1, Math.abs(toIdx - fromIdx)));
  gameState.setHopStart(sketchMillis());
  gameState.setFrogIdx(toIdx);
  gameState.setAnimating(true);
}



/* Audio */
const audioCtx = new AudioContext();
const samples = [
  new Audio(`${import.meta.env.BASE_URL}sounds/frog-math-hop.mp3`),
];
samples.forEach((a) => (a.preload = "auto"));

const victorySample = new Audio(
  `${import.meta.env.BASE_URL}sounds/frog-victory.mp3`,
);
victorySample.preload = "auto";

export function playHopSound(hopDur: number) {
  const clip = samples[0].cloneNode() as HTMLAudioElement;
  clip.playbackRate = playbackRate(hopDur);
  clip.volume = 0.7;
  if (audioCtx.state === "suspended") audioCtx.resume();
  clip.play().catch(() => {});
}

export function playVictorySound() {
  const clip = victorySample.cloneNode() as HTMLAudioElement;
  clip.volume = 0.9;
  if (audioCtx.state === "suspended") audioCtx.resume();
  clip.play().catch(() => {});
}

// Shared displayAvailablePads logic
export function shouldDisplayAvailablePads(mode: "single" | "multi") {
  return mode === "single";
}

// Shared arrow key enable logic
export function shouldEnableArrowKeys(mode: "single" | "multi") {
  return mode === "single";
}

/* Shared game state management */
export interface GameState {
  // Getters
  readonly frogIdx: number;
  readonly hopStart: number;
  readonly hopDur: number;
  readonly fromIdx: number;
  readonly toIdx: number;
  readonly animating: boolean;
  
  // Setters
  setFrogIdx: (n: number) => void;
  setFromIdx: (n: number) => void;
  setToIdx: (n: number) => void;
  setHopStart: (n: number) => void;
  setHopDur: (n: number) => void;
  setAnimating: (b: boolean) => void;
}

export function createGameState(): GameState {
  let frogIdx = 0;
  let hopStart = 0;
  let hopDur = MS_PER_PAD;
  let fromIdx = 0;
  let toIdx = 0;
  let animating = false;

  return {
    // Getters
    get frogIdx() { return frogIdx; },
    get hopStart() { return hopStart; },
    get hopDur() { return hopDur; },
    get fromIdx() { return fromIdx; },
    get toIdx() { return toIdx; },
    get animating() { return animating; },
    
    // Setters
    setFrogIdx: (n: number) => { frogIdx = n; },
    setFromIdx: (n: number) => { fromIdx = n; },
    setToIdx: (n: number) => { toIdx = n; },
    setHopStart: (n: number) => { hopStart = n; },
    setHopDur: (n: number) => { hopDur = n; },
    setAnimating: (b: boolean) => { 
      if (animating && !b) {
        frogIdx = toIdx; // Update frog position when animation ends
      }
      animating = b; 
    },
  };
}
