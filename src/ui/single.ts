/// <reference types="p5/global" />
import p5 from 'p5';
import { gap, canvas, playHopSound, shouldDisplayAvailablePads, shouldEnableArrowKeys, worldX, debugMode, toggleDebug, FEATURES } from './shared';
import { MS_PER_PAD, hopDuration, nextIndex, frogYArc } from '../frogPhysics';
import { addBackToMenu, wrapCenteredContent, createInstructionBanner } from './uiHelpers';
import { resetFrog, animateFrogIntro } from './shared';
import '../ui/sharedStyle.css';

const HOP_RANGE = [0,1,2,3,4,5,6,7,8,9,10];   // change range if you like

let frogIdx = 0;
let hopSize = 3;
let hopStart = 0;
let fromIdx = 0;
let toIdx = 0;
let hopDur = MS_PER_PAD;  // Will be calculated based on distance

export function mountSingle(root: HTMLElement) {
  root.innerHTML = '';
  addBackToMenu(root);
  new p5(p => {
    let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

    function startHop(direction: 1 | -1) {
      const targetIdx = hopSize === 0 ? frogIdx : nextIndex(frogIdx, hopSize, direction);
      const padsTravelled = Math.abs(targetIdx - frogIdx);
      hopDur = hopDuration(padsTravelled);
      fromIdx = frogIdx;
      toIdx = targetIdx;
      frogIdx = targetIdx;
      hopStart = p.millis();
      playHopSound(hopDur);
    }

    function setFrogIdx(n: number) { frogIdx = n; }
    function setFromIdx(n: number) { fromIdx = n; }
    function setToIdx(n: number) { toIdx = n; }
    function setHopStart(n: number) { hopStart = n; }
    function setHopDur(n: number) { hopDur = n; }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function setAnimating(_b: boolean) { /* not used in single, but required for shared */ }

    p.setup = () => {
      // Create UI elements first
      const ui = document.createElement('div');
      ui.id = 'ui';
      ui.innerHTML = `
        <div class="hop-controls">
          <select id="hopSelect"></select>
          <div class="hop-buttons">
            <button id="leftBtn">← Hop Left</button>
            <button id="rightBtn">Hop Right →</button>
          </div>
        </div>
      `;

      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        #ui { 
          display: flex; 
          margin: 0 auto 8px auto;
          width: 100%;
          padding: 0 10px;
        }
        .hop-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          align-items: center;
        }
        .hop-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          width: 100%;
        }
        #ui button { 
          padding: 8px 16px; 
          font-size: 16px; 
          min-width: 120px;
          max-width: 160px;
        }
        #hopSelect { 
          width: 100%;
          max-width: 200px;
          padding: 8px;
          font-size: 16px;
          border-radius: 4px;
          border: 1px solid #ccc;
        }
        #belowSketch {
          display: flex;
          gap: 8px;
          margin-top: 16px;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
          padding: 0 10px;
        }
        #belowSketch button {
          padding: 8px 16px;
          font-size: 16px;
          flex: 1;
          max-width: 160px;
        }
        canvas { 
          display: block; 
          margin: 16px auto 0 auto;
          max-width: 100%;
        }
      `;

      // Now create canvas
      const canvasElem = p.createCanvas(canvas.w, canvas.h).elt;
      p.textSize(24);

      // Place belowSketch after the canvas
      const belowSketch = document.createElement('div');
      belowSketch.id = 'belowSketch';
      belowSketch.innerHTML = `
        ${FEATURES.showToggleLabelsButton ? '<button id="toggleDebugBtn">Toggle Labels</button>' : ''}
        <button id="resetFrogBtn">Reset Frog</button>
      `;

      // Center all UI elements
      const container = document.createElement('div');
      container.appendChild(ui);
      container.appendChild(style);
      container.appendChild(canvasElem);
      container.appendChild(belowSketch);
      root.appendChild(createInstructionBanner('Meet the hoppers! 🐸'));
      root.appendChild(wrapCenteredContent(container));

      // Add hop button listeners
      root.querySelector('#leftBtn')!
        .addEventListener('click', () => {
          if (p.millis() - hopStart >= hopDur) startHop(-1);
        });
      root.querySelector('#rightBtn')!
        .addEventListener('click', () => {
          if (p.millis() - hopStart >= hopDur) startHop(1);
        });

      // Add debug and reset button listeners
      if (FEATURES.showToggleLabelsButton) {
        root.querySelector('#toggleDebugBtn')!
          .addEventListener('click', toggleDebug);
      }
      root.querySelector('#resetFrogBtn')!
        .addEventListener('click', () => {
          resetFrog(
            frogIdx,
            setFrogIdx,
            setFromIdx,
            setToIdx,
            setHopStart,
            setHopDur,
            setAnimating,
            () => p.millis()
          );
        });

      const hopSel = root.querySelector('#hopSelect') as HTMLSelectElement;

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
      if (shouldEnableArrowKeys('single')) {
        keydownHandler = (e: KeyboardEvent) => {
          if (p.millis() - hopStart < hopDur) return;
          if (e.key === 'ArrowRight' || e.key === 'd') startHop(1);
          if (e.key === 'ArrowLeft' || e.key === 'a') startHop(-1);
        };
        window.addEventListener('keydown', keydownHandler);
      }

      // Animate frog intro from 0 to 0 (no sound)
      animateFrogIntro(
        0, // fromIdx
        0, // toIdx
        setFrogIdx,
        setFromIdx,
        setToIdx,
        setHopStart,
        setHopDur,
        setAnimating,
        () => p.millis()
      );

      // Clean up event listener when unmounting
      const observer = new MutationObserver(() => {
        if (!root.contains(ui)) {
          if (keydownHandler) window.removeEventListener('keydown', keydownHandler);
          observer.disconnect();
        }
      });
      observer.observe(root, { childList: true });
    };

    p.draw = () => {
      const t = p.millis();

      // --- Animate frog position ---
      const alpha = p.constrain((t - hopStart) / hopDur, 0, 1);
      const frogXw = p.lerp(fromIdx, toIdx, alpha) * gap;
      const frogY = frogYArc(alpha, canvas.h / 2, 20);

      // --- Camera follows frog ---
      const camX = frogXw - canvas.w / 2;

      p.background(255);

      // --- Draw lily pads within ±10 of frog, always show at least -10 to ... ---
      const start = Math.min(-10, frogIdx - 10);
      const end = frogIdx + 10;
      const showAvailable = shouldDisplayAvailablePads('single');
      for (let i = start; i <= end; i++) {
        // Skip the current pad - we'll draw it last
        if (i === frogIdx) continue;
        
        const screenX = worldX(i) - camX;
        const reachable = ((i - frogIdx) % hopSize + hopSize) % hopSize === 0;
        p.fill(showAvailable && reachable ? '#8f8' : '#ddd');
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
  }, root);
}

export const setHopSize = (n: number) => { hopSize = n; }; 