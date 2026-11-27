import test from "node:test";
import assert from "node:assert/strict";
import { clampAudioVolume } from "../src/gameAudio.js";

test("audio volume is clamped between mute and full volume", () => {
  assert.equal(clampAudioVolume(-1), 0);
  assert.equal(clampAudioVolume(0), 0);
  assert.equal(clampAudioVolume(0.7), 0.7);
  assert.equal(clampAudioVolume(1), 1);
  assert.equal(clampAudioVolume(4), 1);
  assert.equal(clampAudioVolume("0.25"), 0.25);
  assert.equal(clampAudioVolume("invalid"), 0);
});


test("music and SFX volume settings persist between audio instances", async () => {
  const { createGameAudio } = await import("../src/gameAudio.js");
  const previousStorage = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
  };
  try {
    const first = createGameAudio();
    first.setMusicVolume(0.25);
    first.setSfxVolume(0.5);
    first.setMusicEnabled(false);
    first.setSfxEnabled(false);
    const second = createGameAudio();
    assert.equal(second.getMusicVolume(), 0.25);
    assert.equal(second.getSfxVolume(), 0.5);
    assert.equal(second.isMusicEnabled(), false);
    assert.equal(second.isSfxEnabled(), false);
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});


test("stopping audio clears queued notes and suspends active audio", async () => {
  const { createGameAudio } = await import("../src/gameAudio.js");
  const previous = {
    window: globalThis.window,
    localStorage: globalThis.localStorage,
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
  };
  const timers = new Map();
  const oscillators = [];
  let nextTimer = 1;
  let suspended = false;
  let audioContext;
  class FakeAudioContext {
    constructor() { this.state = "running"; this.currentTime = 0; this.destination = {}; audioContext = this; }
    resume() { this.state = "running"; return Promise.resolve(); }
    suspend() { this.state = "suspended"; suspended = true; return Promise.resolve(); }
    createOscillator() {
      const oscillator = {
        frequency: { setValueAtTime() {} },
        connect() {}, disconnect() {},
        start() {},
        stop() { this.stopCalls = (this.stopCalls || 0) + 1; },
        type: "triangle",
      };
      oscillators.push(oscillator);
      return oscillator;
    }
    createGain() {
      return {
        gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {}, disconnect() {},
      };
    }
  }
  globalThis.window = { AudioContext: FakeAudioContext };
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
  globalThis.setTimeout = (callback) => {
    const id = nextTimer++;
    timers.set(id, callback);
    return id;
  };
  globalThis.clearTimeout = (id) => timers.delete(id);
  try {
    const audio = createGameAudio();
    audio.unlock();
    audio.play("fire");
    assert.ok(timers.size > 0, "music and effects should queue follow-up notes");
    audio.stop();
    assert.equal(timers.size, 0, "stop should clear all queued notes");
    assert.ok(oscillators.some((oscillator) => oscillator.stopCalls > 0),
      "stop should terminate currently playing oscillators");
    assert.equal(suspended, true, "stop should suspend the audio context");

    // Even with SFX muted, the first player interaction after returning
    // from the background must resume the selected music track.
    audio.setSfxEnabled(false);
    const oscillatorCountBeforeResume = oscillators.length;
    audio.play("jump");
    assert.equal(audioContext.state, "running", "a new player interaction should resume the suspended context");
    assert.ok(timers.size > 0, "the selected music track should resume after the first interaction");
    assert.ok(oscillators.length > oscillatorCountBeforeResume,
      "music notes should be scheduled even when sound effects are muted");
    audio.stop();
  } finally {
    globalThis.window = previous.window;
    globalThis.localStorage = previous.localStorage;
    globalThis.setTimeout = previous.setTimeout;
    globalThis.clearTimeout = previous.clearTimeout;
  }
});
