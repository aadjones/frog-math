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
  frogIdx: number,
  setFrogIdx: (n: number) => void,
  setFromIdx: (n: number) => void,
  setToIdx: (n: number) => void,
  setHopStart: (n: number) => void,
  setHopDur?: (n: number) => void,
  setAnimating?: (b: boolean) => void,
  sketchMillis?: () => number,
) {
  setFromIdx(frogIdx);
  setToIdx(0);
  setFrogIdx(0);

  // Handle animation if animation parameters are provided
  if (setHopDur && setAnimating && sketchMillis) {
    setHopDur(MS_PER_PAD * Math.max(1, Math.abs(frogIdx)));
    setHopStart(sketchMillis());
    setAnimating(true);
  } else {
    // Instant reset
    setHopStart(performance.now());
  }
}

/* Frog intro animation (no sound) */
export function animateFrogIntro(
  fromIdx: number,
  toIdx: number,
  setFrogIdx: (n: number) => void,
  setFromIdx: (n: number) => void,
  setToIdx: (n: number) => void,
  setHopStart: (n: number) => void,
  setHopDur: (n: number) => void,
  sketchMillis: () => number,
  setAnimating?: (b: boolean) => void,
) {
  setFromIdx(fromIdx);
  setToIdx(toIdx);
  setHopDur(MS_PER_PAD * Math.max(1, Math.abs(toIdx - fromIdx)));
  setHopStart(sketchMillis());
  setFrogIdx(toIdx);
  if (setAnimating) {
    setAnimating(true);
  }
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
