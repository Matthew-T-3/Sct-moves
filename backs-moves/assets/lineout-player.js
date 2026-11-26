// This adapter selects an authored move using the animation's own controls.
(() => {
  const params = new URLSearchParams(location.search);
  const moveNumber = Number(params.get("move")) || 1;
  const moveButton = document.getElementById("m" + moveNumber) || document.getElementById("m1");
  const optionNumber = Number(params.get("option")) || 1;
  const optionButton = document.getElementById("o" + optionNumber) || document.getElementById("o1");
  moveButton.click();
  if (moveButton.id === "m4") optionButton.click();

  const timeline = document.getElementById("sl");
  // Stop on the settled formation, one timeline step before the first call.
  // Replay still runs the original walk-in from the beginning.
  const firstCall = CFG[move].caps[1][0];
  timeline.value = String(Math.max(0, firstCall - Number(timeline.step)));
  timeline.dispatchEvent(new Event("input"));
  timeline.setAttribute("aria-label", "Animation timeline");
  const svg = document.getElementById("s");
  svg.setAttribute("viewBox", "0 128 360 312");
  const name = moveButton.textContent.split(" · ").at(-1);
  const title = moveButton.id === "m4" ? name + " · " + optionButton.textContent : name;
  function setTitle() {
    document.getElementById("h1").textContent = title;
    document.title = title + " | Lineout animation";
  }
  setTitle();
  document.getElementById("rp").addEventListener("click", setTitle);
  const embedded = window.parent !== window;
  if (embedded) {
    document.documentElement.dataset.embedded = "";
    const main = document.querySelector("main");
    const reportSize = () => window.parent.postMessage({ type: "sct-player-size", height: Math.ceil(main.getBoundingClientRect().height) }, "*");
    new ResizeObserver(reportSize).observe(main);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") window.parent.postMessage({ type: "sct-close-player" }, "*");
    });
    reportSize();
  }
})();
