export const MS_PER_PAD = 120;
export const AUDIO_REF_MS = 496;

export function hopDuration(padsTravelled: number): number {
  return Math.max(1, padsTravelled) * MS_PER_PAD;
}

export function playbackRate(hopDurMs: number): number {
  return AUDIO_REF_MS / hopDurMs;
}

export function nextIndex(cur: number, hopSize: number, dir: 1 | -1): number {
  return cur + dir * hopSize;
}

// Frog arc helper
export function frogYArc(alpha: number, baseY: number = 80, amplitude: number = 20): number {
  return baseY - amplitude * Math.sin(alpha * Math.PI);
}

export function modIndex(cur: number, hop: number, n: number, dir: 1 | -1): number {
  return ((cur + dir * hop) % n + n) % n;
} 