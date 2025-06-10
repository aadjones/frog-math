/// <reference types="p5/global" />
import p5 from "p5";
import {
  canvas,
  playHopSound,
  shouldEnableArrowKeys,
  debugMode,
  toggleDebug,
  getFeatureFlag,
} from "./shared";
import { MS_PER_PAD, hopDuration, nextIndex } from "../frogPhysics";
import {
  addBackToMenu,
  wrapCenteredContent,
  createInstructionBanner,
} from "./uiHelpers";
import { resetFrog, animateFrogIntro } from "./shared";
import { drawAnimationFrame } from "./animation";
import { loadFrogImageForP5 } from "./imageLoader";
import "../ui/sharedStyle.css";

const HOP_RANGE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // change range if you like

let frogIdx = 0;
let hopSize = 3;
let hopStart = 0;
let fromIdx = 0;
let toIdx = 0;
let hopDur = MS_PER_PAD; // Will be calculated based on distance
let animating = false;
let ready = false;

export function mountSingle(root: HTMLElement) {
  root.innerHTML = "";
  addBackToMenu(root);
  new p5((p) => {
    let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
    let frogImage: p5.Image | null = null;

    function setFrogIdx(n: number) {
      frogIdx = n;
    }
    function setFromIdx(n: number) {
      fromIdx = n;
    }
    function setToIdx(n: number) {
      toIdx = n;
    }
    function setHopStart(n: number) {
      hopStart = n;
    }
    function setHopDur(n: number) {
      hopDur = n;
    }
    function setAnimating(b: boolean) {
      animating = b;
    }

    function startHop(direction: 1 | -1) {
      if (animating) return;
      const targetIdx =
        hopSize === 0 ? frogIdx : nextIndex(frogIdx, hopSize, direction);
      const padsTravelled = Math.abs(targetIdx - frogIdx);
      hopDur = hopDuration(padsTravelled);
      fromIdx = frogIdx;
      toIdx = targetIdx;
      frogIdx = targetIdx;
      hopStart = p.millis();
      animating = true;
      playHopSound(hopDur);
    }

    p.setup = async () => {
      // Load frog image
      try {
        frogImage = await loadFrogImageForP5(p);
      } catch {
        console.warn("Failed to load frog image, using emoji fallback");
        frogImage = null;
      }

      // Create UI elements first
      const ui = document.createElement("div");
      ui.id = "ui";
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
      const style = document.createElement("style");
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
      ready = true;

      // Place belowSketch after the canvas
      const belowSketch = document.createElement("div");
      belowSketch.id = "belowSketch";
      belowSketch.innerHTML = `
        ${getFeatureFlag("showToggleLabelsButton") ? '<button id="toggleDebugBtn">Toggle Labels</button>' : ""}
        <button id="resetFrogBtn">Reset Frog</button>
      `;

      // Center all UI elements
      const container = document.createElement("div");
      container.appendChild(ui);
      container.appendChild(style);
      container.appendChild(canvasElem);
      container.appendChild(belowSketch);
      root.appendChild(createInstructionBanner("Meet the hoppers!"));
      root.appendChild(wrapCenteredContent(container));

      // Add hop button listeners
      root.querySelector("#leftBtn")!.addEventListener("click", () => {
        if (!ready) return;
        if (p.millis() - hopStart >= hopDur) startHop(-1);
      });
      root.querySelector("#rightBtn")!.addEventListener("click", () => {
        if (!ready) return;
        if (p.millis() - hopStart >= hopDur) startHop(1);
      });

      // Add debug and reset button listeners
      if (getFeatureFlag("showToggleLabelsButton")) {
        root
          .querySelector("#toggleDebugBtn")!
          .addEventListener("click", toggleDebug);
      }
      root.querySelector("#resetFrogBtn")!.addEventListener("click", () => {
        if (!ready) return;
        if (animating) return;
        resetFrog(
          frogIdx,
          setFrogIdx,
          setFromIdx,
          setToIdx,
          setHopStart,
          setHopDur,
          setAnimating,
          () => p.millis(),
        );
      });

      const hopSel = root.querySelector("#hopSelect") as HTMLSelectElement;

      // Disable keyboard navigation on select element
      hopSel.addEventListener("keydown", (e) => {
        if (e.key.startsWith("Arrow")) {
          e.preventDefault();
        }
      });

      // generate options once
      HOP_RANGE.forEach((n) => {
        const opt = document.createElement("option");
        opt.value = n.toString(); // numeric value for code
        opt.textContent = `${n}-hopper`; // user‑facing label
        hopSel.appendChild(opt);
      });

      // set initial selection to current hopSize
      hopSel.value = hopSize.toString();

      hopSel.addEventListener("change", (e) => {
        hopSize = +(e.target as HTMLSelectElement).value; // value still numeric
      });

      // Add keyboard controls
      if (shouldEnableArrowKeys("single")) {
        keydownHandler = (e: KeyboardEvent) => {
          if (!ready) return;
          if (p.millis() - hopStart < hopDur) return;
          if (e.key === "ArrowRight" || e.key === "d") {
            e.preventDefault();
            e.stopPropagation();
            startHop(1);
          }
          if (e.key === "ArrowLeft" || e.key === "a") {
            e.preventDefault();
            e.stopPropagation();
            startHop(-1);
          }
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            e.stopPropagation();
          }
        };
        window.addEventListener("keydown", keydownHandler, true);
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
        () => p.millis(),
        setAnimating,
      );

      // Clean up event listener when unmounting
      const observer = new MutationObserver(() => {
        if (!root.contains(ui)) {
          if (keydownHandler)
            window.removeEventListener("keydown", keydownHandler);
          observer.disconnect();
        }
      });
      observer.observe(root, { childList: true });
    };

    p.draw = () => {
      p.push();
      drawAnimationFrame({
        p,
        state: {
          frogIdx,
          fromIdx,
          toIdx,
          hopStart,
          hopDur,
          animating,
          setAnimating,
        },
        isReachable: (idx) =>
          (((idx - frogIdx) % hopSize) + hopSize) % hopSize === 0,
        showBadge: (frogXw, frogY, camX) => {
          // Adjust badge position for the frog image - move it above the frog
          const badgeX = frogXw - camX;
          const badgeOffset = 40;
          const badgeY = frogY - badgeOffset;
          // Draw badge circle
          p.fill(255);
          p.stroke(0);
          p.strokeWeight(1);
          p.circle(badgeX, badgeY, 20);

          // Draw badge text with explicit alignment
          p.fill(0);
          p.noStroke();
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(14);
          p.text(hopSize.toString(), badgeX, badgeY);
        },
        debugMode,
        frogImage,
      });
      p.pop();
    };
  }, root);
}

export const setHopSize = (n: number) => {
  hopSize = n;
};
