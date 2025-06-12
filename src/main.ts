import "./styles/main.scss";
import { mountMenu } from "./ui/menu";

const root = document.getElementById("app")!; // add <div id="app"></div> in index.html
mountMenu(root, async (mode) => {
  root.innerHTML = ""; // clear menu
  if (mode === "single") {
    const { mountSingle } = await import("./ui/single");
    mountSingle(root);
  } else if (mode === "multi") {
    const { mountMulti } = await import("./ui/multi");
    mountMulti(root);
  } else if (mode === "pond") {
    const { mountPond } = await import("./ui/pond");
    mountPond(root);
  } else if (mode === "uberhopper") {
    const { mountUberhopper } = await import("./ui/uberhopper");
    mountUberhopper(root);
  } else if (mode === "concepts") {
    const { mountConcepts } = await import("./ui/concepts");
    mountConcepts(root);
  }
});
