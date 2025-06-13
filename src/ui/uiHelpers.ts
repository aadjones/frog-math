export function addBackToMenu(container: HTMLElement) {
  const navDiv = document.createElement("div");
  navDiv.style.margin = "16px 0 8px 12px";
  const backBtn = document.createElement("button");
  backBtn.textContent = "← Back to Menu";
  backBtn.style.fontSize = "16px";
  navDiv.appendChild(backBtn);
  container.appendChild(navDiv);
  backBtn.addEventListener("click", async () => {
    container.innerHTML = "";
    const { mountMenu } = await import("./menu");
    mountMenu(container, async (mode) => {
      container.innerHTML = "";
      if (mode === "single") {
        const { mountSingle } = await import("./single");
        mountSingle(container);
      } else if (mode === "multi") {
        const { mountMulti } = await import("./multi");
        mountMulti(container);
      } else if (mode === "uberhopper") {
        const { mountUberhopper } = await import("./uberhopper");
        mountUberhopper(container);
      } else if (mode === "concepts") {
        const { mountConcepts } = await import("./concepts");
        mountConcepts(container);
      } else {
        const { mountPond } = await import("./pond");
        mountPond(container);
      }
    });
  });
}

export function wrapCenteredContent(content: HTMLElement) {
  const wrapper = document.createElement("div");
  wrapper.className = "centered-content";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";
  wrapper.style.margin = "0 auto";
  wrapper.style.maxWidth = "700px";
  wrapper.style.width = "100%";
  wrapper.style.overflow = "hidden";
  wrapper.style.padding = "20px";
  wrapper.appendChild(content);
  return wrapper;
}

export function createInstructionBanner(message: string) {
  const instructionBanner = document.createElement("div");
  instructionBanner.id = "instructionBanner";
  instructionBanner.style.textAlign = "center";
  instructionBanner.style.fontSize = "1.3rem";
  instructionBanner.style.fontFamily = "'Fredoka One',Comic Sans MS,sans-serif";
  instructionBanner.style.background = "#f3f8e6";
  instructionBanner.style.borderRadius = "12px";
  instructionBanner.style.padding = "10px 0 8px 0";
  instructionBanner.style.margin = "0 auto 12px auto";
  instructionBanner.style.boxShadow = "0 2px 8px #0001";
  instructionBanner.style.maxWidth = "420px";
  instructionBanner.textContent = message;
  return instructionBanner;
}
