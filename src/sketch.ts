/// <reference types="p5/global" />
import p5 from 'p5';
import { MS_PER_PAD, hopDuration, playbackRate, nextIndex } from './frogPhysics';

const gap = 60;
const canvas = { w: 600, h: 160 };

const HOP_RANGE = [0,1,2,3,4,5,6,7,8,9,10];   // change range if you like

let frogIdx = 0;
let hopSize = 3;
let hopStart = 0;
let fromIdx = 0;
let toIdx = 0;
let hopDur = MS_PER_PAD;  // Will be calculated based on distance
let debugMode = true;  // Show numbers by default
let audioCtx: AudioContext;
let samples: HTMLAudioElement[] = [];

const worldX = (idx: number) => idx * gap;

new p5(p => {
  function playHopSound() {
    const src = samples[Math.floor(Math.random() * samples.length)];
    const clip = src.cloneNode() as HTMLAudioElement;

    // compute playbackRate so that clipDuration / rate === hopSec
    const rate = playbackRate(hopDur);
    clip.playbackRate = p.constrain(rate, 0.5, 2.0);   // clamp if you like

    clip.volume = 0.7;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    clip.play().catch(() => {});
  }

  function startHop(direction: 1 | -1) {
    const targetIdx = hopSize === 0 ? frogIdx : nextIndex(frogIdx, hopSize, direction);
    const padsTravelled = Math.abs(targetIdx - frogIdx);
    hopDur = hopDuration(padsTravelled);
    fromIdx = frogIdx;
    toIdx = targetIdx;
    frogIdx = targetIdx;
    hopStart = p.millis();
    playHopSound();
  }

  function toggleDebug() {
    debugMode = !debugMode;
  }

  function resetFrog() {
    fromIdx = frogIdx;
    toIdx = 0;
    frogIdx = 0;
    hopStart = p.millis();
  }

  p.setup = () => {
    p.createCanvas(canvas.w, canvas.h).parent('app');
    p.textSize(24);

    // Initialize audio context
    audioCtx = new AudioContext();
    
    // Load sound sample
    const hopSound = new Audio('/sounds/frog-math-hop.mp3');
    hopSound.preload = 'auto';
    samples = [hopSound];

    // Add hop button listeners
    document.getElementById('leftBtn')!
      .addEventListener('click', () => {
        if (p.millis() - hopStart >= hopDur) startHop(-1);
      });
    document.getElementById('rightBtn')!
      .addEventListener('click', () => {
        if (p.millis() - hopStart >= hopDur) startHop(1);
      });

    // Add debug and reset button listeners to #ui buttons
    document.getElementById('toggleDebugBtn')!
      .addEventListener('click', toggleDebug);
    document.getElementById('resetFrogBtn')!
      .addEventListener('click', resetFrog);

    const hopSel = document.getElementById('hopSelect') as HTMLSelectElement;

    // generate options once
    HOP_RANGE.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n.toString();        // numeric value for code
      opt.textContent = `${n}-hopper`; // user‑facing label
      hopSel.appendChild(opt);
    });

    // set initial selection to current hopSize
    hopSel.value = hopSize.toString();

    hopSel.addEventListener('change', e => {
      hopSize = +(e.target as HTMLSelectElement).value;   // value still numeric
    });

    // Add keyboard controls
    window.addEventListener('keydown', e => {
      if (p.millis() - hopStart < hopDur) return;
      if (e.key === 'ArrowRight' || e.key === 'd') startHop(1);
      if (e.key === 'ArrowLeft' || e.key === 'a') startHop(-1);
    });
  };

  p.draw = () => {
    const t = p.millis();

    // --- Animate frog position ---
    const alpha = p.constrain((t - hopStart) / hopDur, 0, 1);
    const frogXw = p.lerp(fromIdx, toIdx, alpha) * gap;
    const frogY = canvas.h / 2 - 20 * p.sin(alpha * Math.PI);

    // --- Camera follows frog ---
    const camX = frogXw - canvas.w / 2;

    p.background(255);

    // --- Draw lily pads within ±10 of frog ---
    const start = frogIdx - 10;
    const end = frogIdx + 10;
    for (let i = start; i <= end; i++) {
      // Skip the current pad - we'll draw it last
      if (i === frogIdx) continue;
      
      const screenX = worldX(i) - camX;
      const reachable = ((i - frogIdx) % hopSize + hopSize) % hopSize === 0;
      p.fill(reachable ? '#8f8' : '#ddd');
      p.circle(screenX, canvas.h / 2, 24);

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

    // --- Draw frog emoji ---
    p.textSize(32);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('🐸', frogXw - camX, frogY - 12);

    // ---- badge ----
    p.textSize(14);
    p.fill(255);
    p.circle(frogXw - camX, frogY - 36, 20);
    p.fill(0);
    p.text(hopSize.toString(), frogXw - camX, frogY - 36);
  };
});

export const setHopSize = (n: number) => { hopSize = n; };
