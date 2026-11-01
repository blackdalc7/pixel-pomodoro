import assert from "node:assert/strict";
import { test } from "node:test";
import * as T from "../src/timer.js";

const fast = { focus: 10, shortBreak: 3, longBreak: 6, roundsBeforeLong: 2 };

test("new timer starts in focus mode, paused, with full time", () => {
  const s = T.createTimer();
  assert.equal(s.mode, "focus");
  assert.equal(s.running, false);
  assert.equal(s.remaining, 25 * 60);
});

test("tick does nothing while paused", () => {
  const s = T.createTimer(fast);
  assert.equal(T.tick(s, 5).state.remaining, 10);
});

test("tick counts down while running", () => {
  const s = T.start(T.createTimer(fast));
  const { state, event } = T.tick(s, 4);
  assert.equal(state.remaining, 6);
  assert.equal(event, null);
});

test("finishing focus moves to a short break and counts the tomato", () => {
  const s = T.start(T.createTimer(fast));
  const { state, event } = T.tick(s, 10);
  assert.deepEqual(event, { finished: "focus", upcoming: "shortBreak" });
  assert.equal(state.mode, "shortBreak");
  assert.equal(state.remaining, 3);
  assert.equal(state.completedFocus, 1);
  assert.equal(state.running, false);
});

test("every Nth focus session earns a long break", () => {
  let s = T.createTimer(fast);
  s = T.tick(T.start(s), 10).state; // focus 1 -> short
  s = T.tick(T.start(s), 3).state; // short -> focus
  const { state } = T.tick(T.start(s), 10); // focus 2 -> long
  assert.equal(state.mode, "longBreak");
  assert.equal(state.completedFocus, 2);
});

test("breaks always return to focus", () => {
  const s = T.start(T.switchMode(T.createTimer(fast), "longBreak"));
  assert.equal(T.tick(s, 6).state.mode, "focus");
});

test("reset restores the full duration of the current mode", () => {
  let s = T.start(T.createTimer(fast));
  s = T.tick(s, 7).state;
  s = T.reset(s);
  assert.equal(s.remaining, 10);
  assert.equal(s.running, false);
});

test("switchMode rejects unknown modes", () => {
  assert.throws(() => T.switchMode(T.createTimer(), "nap"), /unknown mode/);
});

test("formatTime pads minutes and seconds", () => {
  assert.equal(T.formatTime(1500), "25:00");
  assert.equal(T.formatTime(65), "01:05");
  assert.equal(T.formatTime(0.2), "00:01");
  assert.equal(T.formatTime(-3), "00:00");
});

test("progress goes from 0 to 1", () => {
  let s = T.start(T.createTimer(fast));
  assert.equal(T.progress(s), 0);
  s = T.tick(s, 5).state;
  assert.equal(T.progress(s), 0.5);
});
