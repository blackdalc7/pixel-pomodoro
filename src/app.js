import { COFFEE, TOMATO, drawSprite } from "./pixels.js";
import * as T from "./timer.js";

const $ = (id) => document.getElementById(id);
const els = {
  time: $("time"),
  label: $("label"),
  start: $("start"),
  reset: $("reset"),
  canvas: $("sprite"),
  streak: $("streak"),
  tabs: document.querySelectorAll("nav [data-mode]"),
};
const ctx = els.canvas.getContext("2d");
const LABELS = { focus: "focus time", shortBreak: "short break", longBreak: "long break" };

// Custom durations via the URL, in minutes: index.html?focus=50&short=10&long=20
function settingsFromUrl() {
  const q = new URLSearchParams(location.search);
  const out = {};
  for (const [param, key] of [["focus", "focus"], ["short", "shortBreak"], ["long", "longBreak"]]) {
    const minutes = Number(q.get(param));
    if (minutes > 0) out[key] = Math.round(minutes * 60);
  }
  return out;
}

let state = T.createTimer(settingsFromUrl());
let lastTick = null;

function beep() {
  // Tiny 8-bit style chime with the Web Audio API, no sound files needed.
  try {
    const audio = new AudioContext();
    [660, 880, 990].forEach((freq, i) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.value = 0.05;
      osc.connect(gain).connect(audio.destination);
      osc.start(audio.currentTime + i * 0.15);
      osc.stop(audio.currentTime + i * 0.15 + 0.12);
    });
  } catch {
    /* audio is optional */
  }
}

function render() {
  els.time.textContent = T.formatTime(state.remaining);
  els.label.textContent = LABELS[state.mode];
  els.start.textContent = state.running ? "pause" : "start";
  document.title = `${T.formatTime(state.remaining)} · ${LABELS[state.mode]}`;
  document.body.dataset.mode = state.mode;
  els.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === state.mode));
  els.streak.textContent = "🍅".repeat(state.completedFocus % 8) || "no tomatoes yet";
  const sprite = state.mode === "focus" ? TOMATO : COFFEE;
  drawSprite(ctx, sprite, els.canvas.width / 16, T.progress(state));
}

function loop() {
  const now = performance.now();
  if (state.running) {
    if (lastTick !== null) {
      const { state: next, event } = T.tick(state, (now - lastTick) / 1000);
      state = next;
      if (event) beep();
    }
    lastTick = now;
  } else {
    lastTick = null;
  }
  render();
}

els.start.addEventListener("click", () => {
  state = state.running ? T.pause(state) : T.start(state);
});
els.reset.addEventListener("click", () => {
  state = T.reset(state);
});
els.tabs.forEach((tab) =>
  tab.addEventListener("click", () => {
    state = T.switchMode(state, tab.dataset.mode);
  }),
);
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    els.start.click();
  }
  if (e.key === "r") els.reset.click();
});

// Poll a few times a second. The real elapsed time is measured each call, so
// the countdown stays correct even when the browser throttles background tabs.
setInterval(loop, 200);
loop();
