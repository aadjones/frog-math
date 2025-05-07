import p5 from 'p5';
import { playHopSound } from './shared';
import { hopDuration, modIndex } from '../frogPhysics';
import { addBackToMenu, wrapCenteredContent, createInstructionBanner } from './uiHelpers';

export function mountUberhopper(root: HTMLElement) {
  root.innerHTML = '';
  addBackToMenu(root);
  root.appendChild(createInstructionBanner('Ever-increasing hops! 🚀'));

  const content = document.createElement('div');
  content.innerHTML = `
    <div class="hop-controls" style="display:flex;flex-direction:column;align-items:center;">
   
      <div class="hop-buttons">
        <button id="rightBtn">Hop Right →</button>
      </div>
    </div>
    <div id="pondCanvas"></div>
    <div class="belowSketch" style="display:flex;justify-content:center;margin-top:18px;">
      <button id="resetFrogBtn">Reset Frog</button>
    </div>
  `;
  root.appendChild(wrapCenteredContent(content));

  // Fixed number of pads
  const n = 13;
  let hopNumber = 0;  // Tracks which hop we're on (starts at 0)
  let idx = 0;
  let toIdx = 0;
  let hopStart = 0;
  let hopDur = 0;
  let totalAngle = -Math.PI/2;  // Start at -90 degrees (top of circle)
  let targetAngle = -Math.PI/2;  // The angle we're animating towards
  let isAnimating = false;

  const canvasDiv = content.querySelector('#pondCanvas') as HTMLElement;
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

      // frog position (interpolated)
      let frogAng;
      let frogR;
      const padRadius = 16;
      const frogOffset = 7;
      
      if (hopDur === 0) {
        frogAng = totalAngle;
        frogR = r + padRadius + frogOffset;
      } else {
        const startAng = totalAngle;
        const progress = p.constrain((p.millis() - hopStart) / hopDur, 0, 1);
        frogAng = p.lerp(startAng, targetAngle, progress);
        if (progress === 1) {
          totalAngle = targetAngle;  // Update total angle at end of hop
          isAnimating = false;
          hopDur = 0;
        }
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
      const currentHopSize = 2 * hopNumber + 1;  // 1,3,5,7,...
      p.text(currentHopSize.toString(), bubbleX, bubbleY);
    };
  }, canvasDiv);

  function updateNextHopDisplay() {
    const nextHopSize = 2 * hopNumber + 1;  // Current hop size: 1,3,5,7,...
    const nextPad = modIndex(idx, nextHopSize, n, 1);  // Calculate next landing pad
    const display = content.querySelector('#nextHopDisplay');
    if (display) display.textContent = nextPad.toString();
  }

  function hop() {
    if (isAnimating) return;
    
    const hopSize = 2 * hopNumber + 1;  // 1,3,5,7,...
    toIdx = modIndex(idx, hopSize, n, 1);  // Always hop clockwise (dir = 1)
    idx = toIdx;
    hopDur = hopDuration(hopSize);
    targetAngle = totalAngle + (hopSize / n) * (Math.PI * 2);  // Set new target angle
    hopStart = sketch.millis();
    isAnimating = true;
    playHopSound(hopDur);
    hopNumber++;  // Increment for next hop
    updateNextHopDisplay();
  }

  content.querySelector('#rightBtn')!.addEventListener('click', () => hop());
  content.querySelector('#resetFrogBtn')!.addEventListener('click', () => {
    idx = 0;
    toIdx = 0;
    hopStart = 0;
    hopDur = 0;
    hopNumber = 0;
    totalAngle = -Math.PI/2;  // Reset to starting angle
    updateNextHopDisplay();
  });

  // Keyboard controls
  let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  function enableKeyboardControls() {
    keydownHandler = (e: KeyboardEvent) => {
      if (hopDur !== 0 && (performance.now() - hopStart < hopDur)) return;
      if (e.key === 'ArrowRight' || e.key === 'd') {
        e.preventDefault();
        hop();
      }
    };
    window.addEventListener('keydown', keydownHandler, true);
  }
  enableKeyboardControls();

  // Clean up event listener when unmounting
  const observer = new MutationObserver(() => {
    if (!root.contains(content)) {
      if (keydownHandler) window.removeEventListener('keydown', keydownHandler, true);
      observer.disconnect();
    }
  });
  observer.observe(root, { childList: true });
} 