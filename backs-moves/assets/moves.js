const search = document.querySelector("#move-search");
const tag = document.querySelector("#tag-filter");
const dialog = document.querySelector("#move-dialog");
const content = document.querySelector("#detail-content");
const cards = [...document.querySelectorAll("[data-move]")].map(element => ({
  element,
  terms: normalise(element.dataset.search),
  tags: JSON.parse(element.dataset.tags)
}));
let opener;

function normalise(text) {
  return text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[-–—]/g, " ").trim();
}

function filterMoves() {
  const words = normalise(search.value).split(/\s+/).filter(Boolean);
  let visible = 0;
  for (const card of cards) {
    const matches = words.every(word => card.terms.includes(word)) && (!tag.value || card.tags.includes(tag.value));
    card.element.hidden = !matches;
    if (matches) visible++;
  }
  const noResults = document.querySelector("#no-results");
  if (noResults) noResults.hidden = visible !== 0;
  const status = document.querySelector("#result-status");
  status.classList.toggle("visually-hidden", !cards.length || (!words.length && !tag.value));
  status.textContent = `${visible} of ${cards.length} ${cards.length === 1 ? "move" : "moves"} shown`;
}

function loadFrames(root) {
  for (const frame of root.querySelectorAll("iframe[data-src]")) frame.src = frame.dataset.src;
}

function selectOption(index) {
  const panel = content.querySelector("[data-option-panel]");
  const template = [...content.querySelectorAll("template[data-option]")].find(item => item.dataset.option === index);
  if (!template) return;
  panel.replaceChildren(template.content.cloneNode(true));
  loadFrames(panel);
}

function openMove(button) {
  const template = document.getElementById("detail-" + button.dataset.open);
  if (!template) return;
  opener = button;
  content.replaceChildren(template.content.cloneNode(true));
  const options = content.querySelector("[data-options]");
  if (options) selectOption(options.value);
  else loadFrames(content);
  dialog.showModal();
  dialog.querySelector(".dialog-scroll").scrollTop = 0;
  dialog.querySelector(".close-dialog").focus({ preventScroll: true });
}

search.addEventListener("input", filterMoves);
tag.addEventListener("change", filterMoves);
search.form.addEventListener("submit", event => { event.preventDefault(); filterMoves(); });
document.querySelector("#clear-filters")?.addEventListener("click", () => {
  search.value = "";
  tag.value = "";
  filterMoves();
  search.focus();
});
document.querySelector("#cards")?.addEventListener("click", event => {
  const button = event.target.closest("[data-open]");
  if (button) openMove(button);
});
content.addEventListener("change", event => {
  if (event.target.matches("[data-options]")) selectOption(event.target.value);
});
dialog.querySelector(".close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener("close", () => {
  content.querySelectorAll("video").forEach(video => video.pause());
  content.replaceChildren();
  opener?.focus({ preventScroll: true });
});
// Source-window matching also works with the opaque origin of a sandboxed frame.
window.addEventListener("message", event => {
  if (!dialog.open) return;
  const frame = [...content.querySelectorAll("iframe")].find(item => item.contentWindow === event.source);
  if (!frame) return;
  if (event.data?.type === "sct-close-player") dialog.close();
  if (event.data?.type === "sct-player-size" && Number.isFinite(event.data.height)) {
    frame.style.height = Math.max(160, Math.min(1500, event.data.height + 2)) + "px";
  }
});
