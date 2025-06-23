import p5 from "p5";
import {
  canvas,
  playHopSound,
  debugMode,
  toggleDebug,
  resetFrog,
  animateFrogIntro,
  playVictorySound,
  getFeatureFlag,
  gap,
  createGameState,
} from "./shared";
import { MS_PER_PAD } from "../frogPhysics";
import {
  addBackToMenu,
  wrapCenteredContent,
  createInstructionBanner,
} from "./uiHelpers";
import { drawAnimationFrame } from "./animation";
import { loadFrogImageForP5 } from "./imageLoader";
import { ConfettiSystem } from "./confetti";
import { createMultiHopperLevelManager } from "./levelSets";
import {
  createTouchScrollState,
  setupTouchScroll,
  getCameraX,
  resetManualPosition,
  getSimpleCameraX,
} from "./touchScroll";
import "../ui/sharedStyle.css";

export function mountMulti(root: HTMLElement) {
  root.innerHTML = "";
  addBackToMenu(root);

  // Initialize level manager
  const levelManager = createMultiHopperLevelManager();

  // Add instruction banner directly to root, before wrapper
  const instructionBanner = createInstructionBanner(
    levelManager.getCurrentLevel().description,
  );
  root.appendChild(instructionBanner);

  // Celebration modal
  const modal = document.createElement("div");
  modal.className = "celebration-modal";
  modal.style.display = "none";
  modal.innerHTML = `
    <div class="modal-content">
      <div id="modalMessage"></div>
      <button id="modalBtn">Next Problem</button>
    </div>
  `;
  root.appendChild(modal);

  // Modal styles
  const modalStyle = document.createElement("style");
  modalStyle.textContent = `
    .celebration-modal {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .celebration-modal[style*='none'] { display: none !important; }
    .modal-content {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.12);
      padding: 32px 24px 24px 24px;
      text-align: center;
      min-width: 260px;
      max-width: 90vw;
    }
    #modalMessage {
      font-size: 1.3rem;
      margin-bottom: 24px;
    }
    #modalBtn {
      font-size: 1.1rem;
      padding: 10px 28px;
      border-radius: 8px;
      border: none;
      background: #8f8;
      color: #222;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.2s;
    }
    #modalBtn:hover {
      background: #7ddc7d;
    }
  `;
  document.head.appendChild(modalStyle);

  // Create a wrapper for the rest of the UI
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div id="toolbar">
      <div class="level-indicator">
        <span id="levelInfo">Problem ${levelManager.getCurrentLevelIndex() + 1} of ${levelManager.getTotalLevels()}</span>
      </div>
      <div class="hop-buttons">
        <button id="left5">← 5</button>
        <button id="left7">← 7</button>
        <button id="right5">5 →</button>
        <button id="right7">7 →</button>
      </div>
    </div>
    <div id="pond"></div>
    <div id="belowSketch">
      ${getFeatureFlag("showToggleLabelsButton") ? '<button id="toggleDebugBtn">Toggle Labels</button>' : ""}
      <button id="resetFrogBtn">Reset Frog</button>
    </div>
  `;
  wrapper.appendChild(document.createElement("style")).textContent = `
    #toolbar {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      padding: 0 10px;
      margin-bottom: 8px;
      gap: 8px;
    }
    .level-indicator {
      font-size: 16px;
      font-weight: bold;
      color: #333;
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
  root.appendChild(wrapCenteredContent(wrapper));

  const pond = wrapper.querySelector("#pond") as HTMLElement;
  const levelInfo = wrapper.querySelector("#levelInfo") as HTMLElement;
  const modalMessage = modal.querySelector("#modalMessage") as HTMLElement;
  const modalBtn = modal.querySelector("#modalBtn") as HTMLButtonElement;

  let hasWon = false;
  let awaitingNext = false;
  let ready = false;

  // Initialize confetti system
  const confetti = new ConfettiSystem();

  // Touch/swipe state for mobile scrolling
  const touchScrollState = createTouchScrollState();

  // Game state
  const gameState = createGameState();

  function updateLevelDisplay() {
    const currentLevel = levelManager.getCurrentLevel();
    levelInfo.textContent = `Problem ${levelManager.getCurrentLevelIndex() + 1} of ${levelManager.getTotalLevels()}`;
    instructionBanner.textContent = currentLevel.description;
  }

  function resetForNewLevel() {
    gameState.setFrogIdx(0);
    gameState.setFromIdx(0);
    gameState.setToIdx(0);
    gameState.setAnimating(false);
    hasWon = false;
    awaitingNext = false;
    updateLevelDisplay();
  }

  function showModal(message: string, btnText: string, onClick: () => void) {
    modalMessage.textContent = message;
    modalBtn.textContent = btnText;
    modal.style.display = "flex";
    modalBtn.onclick = () => {
      modal.style.display = "none";
      onClick();
    };
  }

  // Final screen overlay
  const finalScreen = document.createElement("div");
  finalScreen.className = "final-screen-overlay";
  finalScreen.style.display = "none";
  finalScreen.innerHTML = `
    <div class="final-content">
      <div class="final-title">You finished all the problems! 🎉</div>
      <div class="final-subtitle">Problems completed: 3/3</div>
      <div class="final-buttons">
        <button id="playAgainBtn">Play Again</button>
        <button id="backToMenuBtn">Back to Menu</button>
      </div>
    </div>
  `;
  root.appendChild(finalScreen);

  // Final screen styles
  const finalScreenStyle = document.createElement("style");
  finalScreenStyle.textContent = `
    .final-screen-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }
    .final-screen-overlay[style*='none'] { display: none !important; }
    .final-content {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.12);
      padding: 40px 32px 32px 32px;
      text-align: center;
      min-width: 280px;
      max-width: 90vw;
    }
    .final-title {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 18px;
    }
    .final-subtitle {
      font-size: 1.2rem;
      margin-bottom: 32px;
    }
    .final-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
    #playAgainBtn, #backToMenuBtn {
      font-size: 1.1rem;
      padding: 10px 28px;
      border-radius: 8px;
      border: none;
      background: #8f8;
      color: #222;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.2s;
    }
    #playAgainBtn:hover, #backToMenuBtn:hover {
      background: #7ddc7d;
    }
  `;
  document.head.appendChild(finalScreenStyle);

  const playAgainBtn = finalScreen.querySelector(
    "#playAgainBtn",
  ) as HTMLButtonElement;
  const backToMenuBtn = finalScreen.querySelector(
    "#backToMenuBtn",
  ) as HTMLButtonElement;

  playAgainBtn.onclick = () => {
    // Reset level manager and frog state
    levelManager.goToLevel(0);
    levelManager["state"].completedLevels.clear(); // Not ideal, but LevelManager has no public reset
    resetForNewLevel();
    finalScreen.style.display = "none";
  };
  backToMenuBtn.onclick = () => {
    finalScreen.style.display = "none";
    window.location.href = "/frog-math/";
  };

  // p5 sketch
  const sketch = new p5((p) => {
    let frogImage: p5.Image | null = null;

    p.setup = async () => {
      try {
        frogImage = await loadFrogImageForP5(p);
      } catch {
        console.warn("Failed to load frog image, using emoji fallback");
        frogImage = null;
      }
      const canvasElement = p.createCanvas(canvas.w, canvas.h, p.P2D);
      p.textSize(24);

      // Add touch events for mobile scrolling
      setupTouchScroll(canvasElement.canvas, touchScrollState, {
        getCurrentCamX: () =>
          getSimpleCameraX(
            touchScrollState,
            gameState.animating,
            gameState.fromIdx,
            gameState.toIdx,
            gameState.hopStart,
            gameState.hopDur,
            gap,
            canvas.w,
            () => p.millis(),
          ),
      });

      ready = true;
      animateFrogIntro(gameState, 0, 0, () => sketch.millis());
    };

    p.draw = () => {
      p.push();
      confetti.update();
      drawAnimationFrame({
        p,
        state: {
          frogIdx: gameState.frogIdx,
          fromIdx: gameState.fromIdx,
          toIdx: gameState.toIdx,
          hopStart: gameState.hopStart,
          hopDur: gameState.hopDur,
          animating: gameState.animating,
          setAnimating: gameState.setAnimating,
        },
        isReachable: () => false,
        customCamX: getCameraX(
          touchScrollState,
          getSimpleCameraX(
            touchScrollState,
            gameState.animating,
            gameState.fromIdx,
            gameState.toIdx,
            gameState.hopStart,
            gameState.hopDur,
            gap,
            canvas.w,
            () => p.millis(),
          ),
        ),
        showTarget: (idx, screenX) => {
          const currentLevel = levelManager.getCurrentLevel();
          if (idx === currentLevel.target) {
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(24);
            p.text("🪰", screenX, canvas.h / 2);
          }
        },
        showBadge: (frogXw, frogY, camX) => {
          const badgeY = frogY - 40;
          const badgeSpacing = 22;
          const leftBadgeX = frogXw - camX - badgeSpacing / 2;
          const rightBadgeX = frogXw - camX + badgeSpacing / 2;
          p.fill(255);
          p.stroke(0);
          p.strokeWeight(1);
          p.circle(leftBadgeX, badgeY, 20);
          p.fill(0);
          p.noStroke();
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(14);
          p.text("5", leftBadgeX, badgeY);
          p.fill(255);
          p.stroke(0);
          p.strokeWeight(1);
          p.circle(rightBadgeX, badgeY, 20);
          p.fill(0);
          p.noStroke();
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(14);
          p.text("7", rightBadgeX, badgeY);
        },
        debugMode,
        frogImage,
        onWin: () => {
          const currentLevel = levelManager.getCurrentLevel();
          if (
            gameState.frogIdx === currentLevel.target &&
            !gameState.animating &&
            !awaitingNext
          ) {
            if (!hasWon) {
              playVictorySound();
              confetti.start();
              hasWon = true;
              awaitingNext = true;
              // Show final screen overlay directly for last problem
              if (!levelManager.canGoToNextLevel()) {
                finalScreen.style.display = "flex";
              } else {
                showModal("Nice job! You got the fly!", "Next Problem", () => {
                  levelManager.advanceToNextLevel();
                  resetForNewLevel();
                });
              }
            }
          } else {
            hasWon = false;
          }
        },
      });
      p.pop();
      confetti.draw(p);
    };
  }, pond);

  function startHop(dist: number) {
    if (gameState.animating || awaitingNext) return;
    gameState.setFromIdx(gameState.frogIdx);
    gameState.setToIdx(gameState.frogIdx + dist);
    gameState.setHopDur(MS_PER_PAD * Math.abs(dist));
    gameState.setHopStart(sketch.millis());
    gameState.setAnimating(true);
    resetManualPosition(touchScrollState); // Reset manual scroll when hopping
    playHopSound(gameState.hopDur);
  }

  wrapper.querySelector("#left5")!.addEventListener("click", () => {
    if (!ready) return;
    startHop(-5);
  });
  wrapper.querySelector("#left7")!.addEventListener("click", () => {
    if (!ready) return;
    startHop(-7);
  });
  wrapper.querySelector("#right5")!.addEventListener("click", () => {
    if (!ready) return;
    startHop(5);
  });
  wrapper.querySelector("#right7")!.addEventListener("click", () => {
    if (!ready) return;
    startHop(7);
  });

  wrapper.querySelector("#toggleDebugBtn")?.addEventListener("click", () => {
    if (!ready) return;
    toggleDebug();
  });
  wrapper.querySelector("#resetFrogBtn")!.addEventListener("click", () => {
    if (!ready) return;
    if (gameState.animating || awaitingNext) return;
    resetFrog(gameState, () => sketch.millis());
  });
}
