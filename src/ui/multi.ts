import p5 from 'p5';
import { canvas, playHopSound, debugMode, toggleDebug, resetFrog, animateFrogIntro, shouldDisplayAvailablePads, playVictorySound, getFeatureFlag } from './shared';
import { MS_PER_PAD } from '../frogPhysics';
import { addBackToMenu, wrapCenteredContent, createInstructionBanner } from './uiHelpers';
import { drawAnimationFrame } from './animation';
import { loadFrogImageForP5 } from './imageLoader';
import { ConfettiSystem } from './confetti';
import '../ui/sharedStyle.css';

export function mountMulti(root: HTMLElement) {
  root.innerHTML = '';
  addBackToMenu(root);

  // Add instruction banner directly to root, before wrapper
  root.appendChild(createInstructionBanner('A 5-hopper and a 7-hopper had a baby. Try to get the baby to land on the fly! 🪰'));

  // Create a wrapper for the rest of the UI
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="toolbar">
      <div class="hop-buttons">
        <button id="left5">← 5</button>
        <button id="left7">← 7</button>
        <button id="right5">5 →</button>
        <button id="right7">7 →</button>
      </div>
    </div>
    <div id="pond"></div>
    <div id="belowSketch">
      ${getFeatureFlag('showToggleLabelsButton') ? '<button id="toggleDebugBtn">Toggle Labels</button>' : ''}
      <button id="resetFrogBtn">Reset Frog</button>
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    #toolbar {
      display: flex;
      justify-content: center;
      width: 100%;
      padding: 0 10px;
      margin-bottom: 8px;
    }
    .hop-buttons {
      display: flex;
      gap: 8px;
      justify-content: center;
      max-width: 320px;
    }
    #toolbar button {
      padding: 6px 12px;
      font-size: 14px;
      min-width: 60px;
      white-space: nowrap;
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
  wrapper.appendChild(style);

  root.appendChild(wrapCenteredContent(wrapper));

  const pond = wrapper.querySelector('#pond') as HTMLElement;
  const target = 1; // Fly always starts on lilypad #1

  let frogIdx = 0;
  let hopStart = 0;
  let hopDur = MS_PER_PAD;
  let fromIdx = 0;
  let toIdx   = 0;
  let animating = false;
  let hasWon = false;

  // Initialize confetti system
  const confetti = new ConfettiSystem();

  // p5 sketch
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

      p.createCanvas(canvas.w, canvas.h, p.P2D);
      p.textSize(24);
      p.textAlign(p.CENTER, p.CENTER);
      animateFrogIntro(
        0, // fromIdx
        0, // toIdx
        setFrogIdx,
        setFromIdx,
        setToIdx,
        setHopStart,
        setHopDur,
        () => sketch.millis(),
        setAnimating
      );
    };

    p.draw = () => {
      // Update confetti physics
      confetti.update();

      drawAnimationFrame({
        p,
        state: {
          frogIdx,
          fromIdx,
          toIdx,
          hopStart,
          hopDur,
          animating,
          setAnimating
        },
        showAvailable: shouldDisplayAvailablePads('multi'),
        isReachable: (idx) => ((idx - frogIdx) % 5 === 0) || ((idx - frogIdx) % 7 === 0),
        showTarget: (idx, screenX) => {
          if (idx === target) {
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(24);
            p.text('🪰', screenX, canvas.h / 2);
          }
        },
        showBadge: (frogXw, frogY, camX) => {
          // Position badges above the frog image with proper spacing
          const badgeY = frogY - 40; // Same offset as single mode
          const badgeSpacing = 22;
          const leftBadgeX = frogXw - camX - badgeSpacing/2;
          const rightBadgeX = frogXw - camX + badgeSpacing/2;
          
          // Left badge (5)
          p.fill(255);
          p.stroke(0);
          p.strokeWeight(1);
          p.circle(leftBadgeX, badgeY, 20);
          p.fill(0);
          p.noStroke();
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(14);
          p.text('5', leftBadgeX, badgeY);
          
          // Right badge (7)
          p.fill(255);
          p.stroke(0);
          p.strokeWeight(1);
          p.circle(rightBadgeX, badgeY, 20);
          p.fill(0);
          p.noStroke();
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(14);
          p.text('7', rightBadgeX, badgeY);
        },
        debugMode,
        frogImage,
        onWin: () => {
          if (frogIdx === target && !animating) {
            if (!hasWon) {
              playVictorySound();
              confetti.start();
              hasWon = true;
            }
          } else {
            hasWon = false;
          }
        }
      });

      // Draw confetti on top of everything
      confetti.draw(p);
    };
  }, pond);

  function setFrogIdx(n: number) { frogIdx = n; }
  function setFromIdx(n: number) { fromIdx = n; }
  function setToIdx(n: number) { toIdx = n; }
  function setHopStart(n: number) { hopStart = n; }
  function setHopDur(n: number) { hopDur = n; }
  function setAnimating(b: boolean) { animating = b; }

  function startHop(dist:number){
    if (animating) return;
    fromIdx = frogIdx;
    toIdx   = frogIdx + dist;
    frogIdx = toIdx;
    hopDur  = MS_PER_PAD * Math.abs(dist);
    hopStart= sketch.millis();
    animating = true;
    playHopSound(hopDur);
  }

  wrapper.querySelector('#left5')!.addEventListener('click',()=>startHop(-5));
  wrapper.querySelector('#left7')!.addEventListener('click',()=>startHop(-7));
  wrapper.querySelector('#right5')!.addEventListener('click',()=>startHop(5));
  wrapper.querySelector('#right7')!.addEventListener('click',()=>startHop(7));

  wrapper.querySelector('#toggleDebugBtn')?.addEventListener('click', () => toggleDebug());
  wrapper.querySelector('#resetFrogBtn')!.addEventListener('click', () => {
    if (animating) return;
    resetFrog(
      frogIdx,
      setFrogIdx,
      setFromIdx,
      setToIdx,
      setHopStart,
      setHopDur,
      setAnimating,
      () => sketch.millis()
    );
  });
} 