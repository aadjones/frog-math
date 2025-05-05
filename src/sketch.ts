/// <reference types="p5/global" />
import p5 from 'p5';

const gap = 60;
const canvas = { w: 600, h: 160 };

let frogIdx = 0;
let hopSize = 3;
let hopStart = 0;
let fromIdx = 0;
let toIdx = 0;
const HOP_DUR = 300; // ms
let canvasEl: HTMLCanvasElement;
let debugMode = false;

const worldX = (idx: number) => idx * gap;

new p5(p => {
  function onCanvasClick(e: MouseEvent) {
    // Ignore clicks if the frog is mid‑hop
    if (p.millis() - hopStart < HOP_DUR) return;

    // Translate screen → canvas → world coords
    const rect = canvasEl.getBoundingClientRect();
    const xInCanvas = e.clientX - rect.left;
    const camX =
      p.lerp(fromIdx, toIdx, p.constrain((p.millis() - hopStart) / HOP_DUR, 0, 1)) *
        gap -
      canvas.w / 2;
    const clickWorldX = xInCanvas + camX;
    const idx = Math.round(clickWorldX / gap);

    if ((idx - frogIdx) % hopSize === 0) {
      fromIdx = frogIdx;
      toIdx = idx;
      frogIdx = idx;
      hopStart = p.millis();
    }
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
    const renderer = p.createCanvas(canvas.w, canvas.h);
    canvasEl = renderer.canvas;          // save reference
    canvasEl.addEventListener('click', onCanvasClick);
    p.textSize(24);

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
  };

  p.draw = () => {
    const t = p.millis();

    // --- Animate frog position ---
    let alpha = p.constrain((t - hopStart) / HOP_DUR, 0, 1);
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
