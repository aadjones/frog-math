import p5 from 'p5';
import { gap, canvas, playHopSound, worldX, debugMode, toggleDebug, animateFrogReset, animateFrogIntro, shouldDisplayAvailablePads, playVictorySound, FEATURES } from './shared';
import { frogYArc, MS_PER_PAD } from '../frogPhysics';
import { addBackToMenu, wrapCenteredContent, createInstructionBanner } from './uiHelpers';
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
      ${FEATURES.showToggleLabelsButton ? '<button id="toggleDebugBtn">Toggle Labels</button>' : ''}
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

  // p5 sketch
  const sketch = new p5(p => {
    p.setup = () => {
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
        setAnimating,
        () => sketch.millis()
      );
    };

    p.draw = () => {
      const t = p.millis();
      const alpha = animating ? p.constrain((t-hopStart)/hopDur,0,1) : 1;
      if (animating && alpha === 1) animating = false;
      const frogXw = p.lerp(fromIdx,toIdx,alpha)*gap;
      const frogY = frogYArc(alpha, canvas.h/2, 20);
      const camX = frogXw - canvas.w/2;

      p.background(255);

      // draw pads
      const showAvailable = shouldDisplayAvailablePads('multi');
      for(let i=frogIdx-11;i<=frogIdx+11;i++){
        const screenX = worldX(i)-camX;
        const reachable = ((i-frogIdx)%5===0)||((i-frogIdx)%7===0);
        p.fill(showAvailable && reachable ? '#8f8' : (i === frogIdx ? '#8f8' : '#ddd'));
        p.circle(screenX,canvas.h/2,24);
        // Always show the fly on the target pad
        if(i===target) {
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(24);
          p.text('🪰', screenX, canvas.h/2);
        }
        // Draw debug labels if enabled
        if (debugMode) {
          p.fill(0);
          p.textSize(12);
          p.textAlign(p.CENTER, p.TOP);
          p.text(i.toString(), screenX, canvas.h / 2 + 30);
          p.textSize(24); // Reset text size
        }
      }

      // draw frog
      p.textSize(32);
      p.textAlign(p.CENTER,p.CENTER);
      p.text('🐸',frogXw - camX, frogY - 12);

      // draw hop size badges (5 and 7) above the frog
      const badgeY = frogY - 36;
      const badgeSpacing = 22;
      p.textSize(14);
      // Left badge (5)
      p.fill(255);
      p.circle(frogXw - camX - badgeSpacing/2, badgeY, 20);
      p.fill(0);
      p.text('5', frogXw - camX - badgeSpacing/2, badgeY);
      // Right badge (7)
      p.fill(255);
      p.circle(frogXw - camX + badgeSpacing/2, badgeY, 20);
      p.fill(0);
      p.text('7', frogXw - camX + badgeSpacing/2, badgeY);

      // win?
      if (frogIdx===target && !animating) {
        p.text('🎉',frogXw - camX, canvas.h/2-60);
        if (!hasWon) {
          playVictorySound();
          hasWon = true;
        }
      } else {
        hasWon = false;
      }
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
    animateFrogReset(
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