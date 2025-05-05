/// <reference types="p5/global" />
import p5 from 'p5';
import { MS_PER_PAD, hopDuration, playbackRate, nextIndex } from './frogPhysics';

const gap = 60;
const canvas = { w: 600, h: 160 };

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
    p.createCanvas(canvas.w, canvas.h);
    p.textSize(24);

    // Initialize audio context
    audioCtx = new AudioContext();
    
    // Load sound sample
    const hopSound = new Audio('/sounds/frog-math-hop.mp3');
    hopSound.preload = 'auto';
    samples = [hopSound];

    // Create debug controls container
    const debugControls = document.createElement('div');
    debugControls.style.position = 'absolute';
    debugControls.style.top = '10px';
    debugControls.style.right = '10px';
    debugControls.style.display = 'flex';
    debugControls.style.gap = '10px';

    // Create debug toggle button
    const debugButton = document.createElement('button');
    debugButton.textContent = 'Toggle Numbers';
    debugButton.addEventListener('click', toggleDebug);
    debugControls.appendChild(debugButton);

    // Create reset button
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset Frog';
    resetButton.addEventListener('click', resetFrog);
    debugControls.appendChild(resetButton);

    document.body.appendChild(debugControls);

    // Add hop button listeners
    document.getElementById('leftBtn')!
      .addEventListener('click', () => {
        if (p.millis() - hopStart >= hopDur) startHop(-1);
      });
    document.getElementById('rightBtn')!
      .addEventListener('click', () => {
        if (p.millis() - hopStart >= hopDur) startHop(1);
      });
    document.getElementById('hopSelect')!
      .addEventListener('change', e => {
        hopSize = +(e.target as HTMLSelectElement).value;
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
    p.textAlign(p.CENTER, p.CENTER);
    p.text('🐸', frogXw - camX, frogY - 12);
  };
});

export const setHopSize = (n: number) => { hopSize = n; };
