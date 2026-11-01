// Pure Pomodoro logic. No DOM in here so it can be unit tested with `node --test`.

export const DEFAULTS = Object.freeze({
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  roundsBeforeLong: 4,
});

export const MODES = ["focus", "shortBreak", "longBreak"];

/** Create a fresh timer state. Durations are in seconds. */
export function createTimer(settings = DEFAULTS) {
  const cfg = { ...DEFAULTS, ...settings };
  return {
    cfg,
    mode: "focus",
    remaining: cfg.focus,
    running: false,
    completedFocus: 0,
  };
}

/** Which mode comes after the current one finishes. */
export function nextMode(state) {
  if (state.mode !== "focus") return "focus";
  const done = state.completedFocus + 1;
  return done % state.cfg.roundsBeforeLong === 0 ? "longBreak" : "shortBreak";
}

/** Advance the timer by `seconds`. Returns a new state plus an `event` when a session ends. */
export function tick(state, seconds = 1) {
  if (!state.running) return { state, event: null };
  const remaining = state.remaining - seconds;
  if (remaining > 0) return { state: { ...state, remaining }, event: null };

  const finished = state.mode;
  const upcoming = nextMode(state);
  const completedFocus = finished === "focus" ? state.completedFocus + 1 : state.completedFocus;
  return {
    state: {
      ...state,
      mode: upcoming,
      remaining: state.cfg[upcoming],
      running: false,
      completedFocus,
    },
    event: { finished, upcoming },
  };
}

export function start(state) {
  return { ...state, running: true };
}

export function pause(state) {
  return { ...state, running: false };
}

export function reset(state) {
  return { ...state, running: false, remaining: state.cfg[state.mode] };
}

export function switchMode(state, mode) {
  if (!MODES.includes(mode)) throw new Error(`unknown mode: ${mode}`);
  return { ...state, mode, running: false, remaining: state.cfg[mode] };
}

/** 1500 -> "25:00" */
export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/** 0..1, how far through the current session we are (drives the tomato "fill"). */
export function progress(state) {
  const total = state.cfg[state.mode];
  return total === 0 ? 1 : 1 - state.remaining / total;
}
