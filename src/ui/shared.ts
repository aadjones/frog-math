import { MS_PER_PAD, playbackRate } from '../frogPhysics';

/* shared constants & helpers for all frog modes */
export const gap = 60;
export const canvas = { w: 600, h: 160 };

/* World helpers */
export const worldX = (idx: number) => idx * gap;

/* Debug state (shared) */
export let debugMode = true;
export function toggleDebug() { debugMode = !debugMode; }

/* Frog reset helper (shared, instant) */
export function resetFrog(
  frogIdx: number,
  setFrogIdx: (n: number) => void,
  setFromIdx: (n: number) => void,
  setToIdx: (n: number) => void,
  setHopStart: (n: number) => void
) {
  setFromIdx(frogIdx);
  setToIdx(0);
  setFrogIdx(0);
  setHopStart(performance.now());
}

/* Frog reset with animation (no sound) */
export function animateFrogReset(
  frogIdx: number,
  setFrogIdx: (n: number) => void,
  setFromIdx: (n: number) => void,
  setToIdx: (n: number) => void,
  setHopStart: (n: number) => void,
  setHopDur: (n: number) => void,
  setAnimating: (b: boolean) => void,
  sketchMillis: () => number
) {
  setFromIdx(frogIdx);
  setToIdx(0);
  setHopDur(MS_PER_PAD * Math.max(1, Math.abs(frogIdx)));
  setHopStart(sketchMillis());
  setFrogIdx(0);
  setAnimating(true);
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
  setAnimating: (b: boolean) => void,
  sketchMillis: () => number
) {
  setFromIdx(fromIdx);
  setToIdx(toIdx);
  setHopDur(MS_PER_PAD * Math.max(1, Math.abs(toIdx - fromIdx)));
  setHopStart(sketchMillis());
  setFrogIdx(toIdx);
  setAnimating(true);
}

/* Audio */
const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
const samples = [new Audio('/sounds/frog-math-hop.mp3')];
samples.forEach(a => (a.preload = 'auto'));

const victorySample = new Audio('/sounds/frog-victory.mp3');
victorySample.preload = 'auto';

export function playHopSound(hopDur: number) {
  const clip = samples[0].cloneNode() as HTMLAudioElement;
  clip.playbackRate = playbackRate(hopDur);
  clip.volume = 0.7;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  clip.play().catch(() => {});
}

export function playVictorySound() {
  const clip = victorySample.cloneNode() as HTMLAudioElement;
  clip.volume = 0.9;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  clip.play().catch(() => {});
}

// Shared displayAvailablePads logic
export function shouldDisplayAvailablePads(mode: 'single' | 'multi') {
  return mode === 'single';
}

// Shared arrow key enable logic
export function shouldEnableArrowKeys(mode: 'single' | 'multi') {
  return mode === 'single';
} 