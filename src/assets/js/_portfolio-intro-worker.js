/* eslint-env worker */
import { createPortfolioIntroRenderer } from "./_portfolio-intro-renderer.js";

let renderer = null;
function printIntroWorkerDiagnostics(values) {
  self.postMessage({ type: "diagnostics", values });
}
function handleIntroWorkerMessage(event) {
  try {
    if (event.data.type === "init") renderer = createPortfolioIntroRenderer(event.data.canvas, event.data.state, printIntroWorkerDiagnostics);
    else if (event.data.type === "state") renderer?.updateIntroState(event.data.state, event.data.resize);
  } catch {
    self.postMessage({ type: "error" });
  }
}
self.addEventListener("message", handleIntroWorkerMessage);
self.postMessage({ type: "ready", supported: typeof OffscreenCanvas === "function" });
