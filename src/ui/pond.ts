import p5 from 'p5';
import { playHopSound } from './shared';
import { modIndex, hopDuration, MS_PER_PAD } from '../frogPhysics';
import { addBackToMenu, wrapCenteredContent, createInstructionBanner } from './uiHelpers';

export function mountPond(root: HTMLElement) {
  root.innerHTML = '';
  addBackToMenu(root);
  root.appendChild(createInstructionBanner('Explore the pond!'));

  const pondContent = document.createElement('div');
  pondContent.innerHTML = `
    <div class="hop-controls" style="display:flex;flex-direction:column;align-items:center;">
      <div class="pond-selects" style="margin-bottom:18px;">
        <label>pads
          <select id="padSelect">
            ${[8,9,10,11,12,13,20,24].map(n=>`<option>${n}</option>`).join('')}
          </select>
        </label>
        <label>hopper
          <select id="hopSelect"></select>
        </label>
      </div>
      <div class="hop-buttons">
        <button id="leftBtn">← Hop Left</button>
        <button id="rightBtn">Hop Right →</button>
      </div>
    </div>
    <div id="pondCanvas"></div>
    <div class="belowSketch" style="display:flex;justify-content:center;margin-top:18px;">
      <button id="resetFrogBtn">Reset Frog</button>
    </div>
  `;
  root.appendChild(wrapCenteredContent(pondContent));

  const padSel = pondContent.querySelector('#padSelect') as HTMLSelectElement;
  let n = +padSel.value;
  let k = 3;
  let idx = 0;
  let fromIdx = 0;
  let toIdx = 0;
  let hopStart = 0;
  let hopDur = 0;
  let lastDir: 1 | -1 = 1;
  let zeroHopAnimating = false;

  const canvasDiv = pondContent.querySelector('#pondCanvas') as HTMLElement;
  canvasDiv.style.marginTop = '32px';
  const sketch = new p5(p => {
    p.setup = () => p.createCanvas(400, 400);
    p.draw = () => {
      p.background(255);
      p.translate(p.width/2, p.height/2 + 20);

      // draw pads
      const r = 120;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * p.TWO_PI - p.HALF_PI;
        const x = r * Math.cos(a);
        const y = r * Math.sin(a);
        p.fill(i === idx ? '#8f8' : '#ddd');
        p.circle(x, y, 32);
        p.fill(0);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(14);
        p.text(i.toString(), x, y);
      }

      // frog position (interpolated, always in hop direction)
      let frogAng;
      let frogR;
      const padRadius = 16;
      const frogOffset = 7;
      if (zeroHopAnimating && hopDur > 0) {
        // Animate radial bounce for 0-hop
        frogAng = (idx / n) * p.TWO_PI - p.HALF_PI;
        // Use a sine wave for smooth out-and-back
        const progress = p.constrain((p.millis() - hopStart) / hopDur, 0, 1);
        // Bounce out to +20px and back
        const bounce = Math.sin(Math.PI * progress);
        frogR = r + padRadius + frogOffset + 20 * bounce;
        if (progress === 1) zeroHopAnimating = false;
      } else if (hopDur === 0) {
        frogAng = (idx / n) * p.TWO_PI - p.HALF_PI;
        frogR = r + padRadius + frogOffset;
      } else {
        const startAng = (fromIdx / n) * p.TWO_PI - p.HALF_PI;
        const endAng = startAng + lastDir * (k / n) * p.TWO_PI;
        const progress = p.constrain((p.millis() - hopStart) / hopDur, 0, 1);
        frogAng = p.lerp(startAng, endAng, progress);
        frogR = r + padRadius + frogOffset;
      }
      const fx = frogR * Math.cos(frogAng);
      const fy = frogR * Math.sin(frogAng);
      p.textSize(24);
      p.text('🐸', fx, fy);

      // Draw hopper number bubble with radial orientation
      const bubbleOffset = 22;
      const bubbleR = frogR + bubbleOffset;
      const bubbleX = bubbleR * Math.cos(frogAng);
      const bubbleY = bubbleR * Math.sin(frogAng);
      p.textSize(14);
      p.fill(255);
      p.circle(bubbleX, bubbleY, 18);
      p.fill(0);
      p.text(k.toString(), bubbleX, bubbleY);
    };
  }, canvasDiv);

  // populate hopSelect once pads known
  const hopSel = pondContent.querySelector('#hopSelect') as HTMLSelectElement;
  const rebuildHopOptions = () => {
    hopSel.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const opt = document.createElement('option');
      opt.value = i.toString();
      opt.textContent = `${i}-hopper`;
      hopSel.appendChild(opt);
    }
    hopSel.value = k.toString();
  };
  rebuildHopOptions();

  padSel.onchange = () => {
    n = +padSel.value;
    if (k >= n) k = 1;
    rebuildHopOptions();
    idx = 0;
    fromIdx = 0;
    toIdx = 0;
    hopStart = 0;
    hopDur = 0;
    lastDir = 1;
    zeroHopAnimating = false;
  };
  hopSel.onchange = () => {
    k = +hopSel.value;
    fromIdx = idx;
    toIdx = idx;
    hopStart = 0;
    hopDur = 0;
    zeroHopAnimating = false;
  };

  function hop(dir: 1 | -1) {
    fromIdx = idx;
    if (k === 0) {
      toIdx = idx;
      hopDur = MS_PER_PAD;
      hopStart = sketch.millis();
      if (!zeroHopAnimating) playHopSound(MS_PER_PAD);
      zeroHopAnimating = true;
    } else {
      toIdx = modIndex(idx, k, n, dir);
      idx = toIdx;
      hopDur = hopDuration(k);
      hopStart = sketch.millis();
      playHopSound(hopDur);
      lastDir = dir;
    }
  }

  pondContent.querySelector('#leftBtn')!.addEventListener('click', () => hop(-1));
  pondContent.querySelector('#rightBtn')!.addEventListener('click', () => hop(1));
  pondContent.querySelector('#resetFrogBtn')!.addEventListener('click', () => {
    idx = 0;
    fromIdx = 0;
    toIdx = 0;
    hopStart = 0;
    hopDur = 0;
    lastDir = 1;
    zeroHopAnimating = false;
  });

  // Keyboard controls
  let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  function enableKeyboardControls() {
    keydownHandler = (e: KeyboardEvent) => {
      if (hopDur !== 0 && (performance.now() - hopStart < hopDur)) return;
      if (e.key === 'ArrowRight' || e.key === 'd') {
        e.preventDefault();
        hop(1);
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        e.preventDefault();
        hop(-1);
      }
    };
    window.addEventListener('keydown', keydownHandler, true);
  }
  enableKeyboardControls();

  // Clean up event listener when unmounting
  const observer = new MutationObserver(() => {
    if (!root.contains(pondContent)) {
      if (keydownHandler) window.removeEventListener('keydown', keydownHandler, true);
      observer.disconnect();
    }
  });
  observer.observe(root, { childList: true });
} 