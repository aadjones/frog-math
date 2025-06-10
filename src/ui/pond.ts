import p5 from 'p5';
import { playHopSound } from './shared';
import { modIndex, hopDuration, MS_PER_PAD } from '../frogPhysics';
import { addBackToMenu, wrapCenteredContent, createInstructionBanner } from './uiHelpers';
import { loadFrogImageForP5, drawFrog } from './imageLoader';
import { drawLilyPad } from './animation';

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
            ${[7,8,9,10,11,12,13].map(n=>`<option>${n}</option>`).join('')}
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
    let frogImage: p5.Image | null = null;

    p.setup = async () => {
      // Load frog image
      try {
        frogImage = await loadFrogImageForP5(p);
      } catch {
        console.warn('Failed to load frog image, using emoji fallback');
        frogImage = null;
      }

      p.createCanvas(400, 400);
    };

    p.draw = () => {
      p.background(255);
      p.translate(p.width/2, p.height/2);

      const r = 120;
      let frogAng;
      if (zeroHopAnimating && hopDur > 0) {
        // Animate radial bounce for 0-hop
        frogAng = (idx / n) * p.TWO_PI - p.HALF_PI;
        // Use a sine wave for smooth out-and-back
        const progress = p.constrain((p.millis() - hopStart) / hopDur, 0, 1);
        if (progress === 1) zeroHopAnimating = false;
      } else if (hopDur === 0) {
        frogAng = (idx / n) * p.TWO_PI - p.HALF_PI;
      } else {
        const startAng = (fromIdx / n) * p.TWO_PI - p.HALF_PI;
        const endAng = startAng + lastDir * (k / n) * p.TWO_PI;
        const progress = p.constrain((p.millis() - hopStart) / hopDur, 0, 1);
        frogAng = p.lerp(startAng, endAng, progress);
      }
      // Draw pads and numbers
      for (let i = 0; i < n; i++) {
        // Start at top (north, -PI/2)
        const a = (i / n) * p.TWO_PI - Math.PI / 2;
        const x = r * Math.cos(a);
        const y = r * Math.sin(a);
        // Notch faces inward (toward center)
        const notchAngle = a + Math.PI;
        drawLilyPad(
          p,
          x,
          y,
          32,
          '#8f8',
          { notchAngle, notchSize: 1.8, squish: false }
        );
        // Draw number label in the notch, always aligned with the notch
        const labelRadius = 20; // distance from center of pad to label
        const labelX = x + labelRadius * Math.cos(notchAngle);
        const labelY = y + labelRadius * 0.8 * Math.sin(notchAngle);
        p.fill(0);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(14);
        p.text(i.toString(), labelX, labelY);
      }
      // Draw frog on the outside edge of the pad
      const frogRadius = r + 32 / 2 + 8; // pad radius + offset
      const fx = frogRadius * Math.cos(frogAng);
      const fy = frogRadius * Math.sin(frogAng);
      const frogSize = 48;
      drawFrog(p, fx, fy, frogImage, frogSize, true);

      // Draw hopper number bubble with radial orientation
      const bubbleOffset = 0.75 * frogSize;
      const bubbleR = frogRadius + bubbleOffset;
      const bubbleX = bubbleR * Math.cos(frogAng);
      const bubbleY = bubbleR * Math.sin(frogAng);
      p.textSize(18);
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